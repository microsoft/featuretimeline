import * as React from "react";
import "./AddItemPanel.scss";
import { Project } from "../../Models/PortfolioPlanningQueryModels";
import {
    IProject,
    IAddItems,
    IAddItemPanelProjectItems,
    LoadingStatus,
    IAddItem,
    IProjectConfiguration
} from "../../Contracts";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
import { Panel } from "azure-devops-ui/Panel";
import { Dropdown, DropdownCallout } from "azure-devops-ui/Dropdown";
import { Location } from "azure-devops-ui/Utilities/Position";
import { IListBoxItem } from "azure-devops-ui/ListBox";
//import { ListSelection, ScrollableList, ListItem, IListItemDetails, IListRow } from "azure-devops-ui/List";
//import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import {
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    IColumn,
    CheckboxVisibility
} from "office-ui-fabric-react/lib/DetailsList";
import { FormItem } from "azure-devops-ui/FormItem";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { CollapsiblePanel } from "../../Common/Components/CollapsiblePanel";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { ProjectConfigurationDataService } from "../../Common/Services/ProjectConfigurationDataService";
import { Image, IImageProps, ImageFit } from "office-ui-fabric-react/lib/Image";
import { PortfolioTelemetry } from "../../Common/Utilities/Telemetry";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { TextField, TextFieldWidth, TextFieldStyle } from "azure-devops-ui/TextField";

export interface IAddItemPanelProps {
    planId: string;
    epicsInPlan: { [epicId: number]: number };
    onCloseAddItemPanel: () => void;
    onAddItems: (itemsToAdd: IAddItems) => void;
}

interface IAddItemPanelState {
    projects: IListBoxItem[];
    selectedProject: IProject;
    selectedProjectBacklogConfiguration: IProjectConfiguration;
    /**
     * Map of work items to display, grouped by work item type.
     */
    workItemsByLevel: IAddItemPanelProjectItems;

    selectedWorkItems: { [workItemTypeKey: string]: { [workItemId: number]: IAddItem } };
    loadingProjects: boolean;
    loadingProjectConfiguration: boolean;
    errorMessage: string;
}

export class AddItemPanel extends React.Component<IAddItemPanelProps, IAddItemPanelState> {
    //private _selectionByWorkItemType: { [workItemTypeKey: string]: ListSelection } = {};
    private _selectionByWorkItemType: { [workItemTypeKey: string]: Selection } = {};
    //private _indexToWorkItemIdMap: { [workItemTypeKey: string]: { [index: number]: number } } = {};
    //private _workItemIdMap: { [index: number]: IAddItem } = {};
    private _projectConfigurationsCache: { [projectIdKey: string]: IProjectConfiguration } = {};

    /**
     * Number of work items over which search is available for a work item type section.
     */
    private static readonly WORKITEMTYPE_SEARCH_THRESHOLD: number = 20;

    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            selectedProject: null,
            selectedProjectBacklogConfiguration: null,
            workItemsByLevel: {},
            selectedWorkItems: {},
            loadingProjects: true,
            loadingProjectConfiguration: false,
            errorMessage: ""
        };

        this._getAllProjects().then(
            projects => {
                const allProjects = [...this.state.projects];
                projects.forEach(project => {
                    allProjects.push({
                        id: project.ProjectSK,
                        text: project.ProjectName
                    });
                });
                this.setState({
                    projects: allProjects,
                    loadingProjects: false
                });
            },
            error =>
                this.setState({
                    errorMessage: JSON.stringify(error),
                    loadingProjects: false
                })
        );
    }

    public render() {
        return (
            <Panel
                onDismiss={() => this.props.onCloseAddItemPanel()}
                showSeparator={true}
                titleProps={{ text: "Add items" }}
                footerButtonProps={[
                    {
                        text: "Cancel",
                        onClick: () => this.props.onCloseAddItemPanel()
                    },
                    {
                        text: "Add",
                        primary: true,
                        onClick: () => this._onAddEpics(),
                        disabled: Object.keys(this.state.selectedWorkItems).length === 0
                    }
                ]}
            >
                <div className="add-item-panel-container">
                    {this._renderProjectPicker()}
                    <div>{this._renderEpics()}</div>
                </div>
            </Panel>
        );
    }

    private _renderProjectPicker = () => {
        const { loadingProjects } = this.state;

        if (loadingProjects) {
            return <Spinner label="Loading Projects..." size={SpinnerSize.large} className="loading-projects" />;
        } else {
            return (
                <FormItem message={this.state.errorMessage} error={!!this.state.errorMessage}>
                    <div className="projects-label">Projects</div>
                    <Dropdown
                        className="project-picker"
                        placeholder="Select a project"
                        items={this.state.projects}
                        disabled={this.state.loadingProjectConfiguration}
                        onSelect={this._onProjectSelected}
                        renderCallout={props => (
                            <DropdownCallout
                                {...props}
                                dropdownOrigin={{
                                    horizontal: Location.start,
                                    vertical: Location.start
                                }}
                                anchorOrigin={{
                                    horizontal: Location.start,
                                    vertical: Location.start
                                }}
                            />
                        )}
                    />
                </FormItem>
            );
        }
    };

    private _onProjectSelected = async (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        //  Clear selection object for ScrollableList
        this._selectionByWorkItemType = {};
        //this._workItemIdMap = {};
        //this._indexToWorkItemIdMap = {};

        this.setState({
            selectedProject: {
                id: item.id,
                title: item.text
            },
            loadingProjectConfiguration: true
        });

        let errorMessage: string = null;

        try {
            const projectConfiguration = await this._getProjectConfiguration(item.id);
            PortfolioTelemetry.getInstance().TrackAddItemPanelProjectSelected(item.id, projectConfiguration);
            const firstWorkItemType = projectConfiguration.orderedWorkItemTypes[0];
            const firstWorkItemTypeKey = firstWorkItemType.toLowerCase();
            const workItemsOfType = await PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
                item.id,
                firstWorkItemType
            );
            PortfolioTelemetry.getInstance().TrackAddItemPanelWorkItemsOfTypeCount(
                item.id,
                firstWorkItemType,
                workItemsOfType.workItems!.length || 0
            );

            const projectItems: IAddItemPanelProjectItems = {};

            //  Adding all work item types in project.
            projectConfiguration.orderedWorkItemTypes.forEach(wiType => {
                const wiTypeKey = wiType.toLowerCase();
                projectItems[wiTypeKey] = {
                    workItemTypeDisplayName: wiType,
                    loadingStatus: LoadingStatus.NotLoaded,
                    loadingErrorMessage: null,
                    items: null,
                    workItemsFoundInProject: 0,
                    searchKeyword: null
                };
            });

            //  Populating work items for first type.
            const items: { [workItemId: number]: IAddItem } = {};
            if (workItemsOfType.exceptionMessage && workItemsOfType.exceptionMessage.length > 0) {
                projectItems[firstWorkItemTypeKey] = {
                    workItemTypeDisplayName: firstWorkItemType,
                    loadingStatus: LoadingStatus.Loaded,
                    loadingErrorMessage: workItemsOfType.exceptionMessage,
                    items: null,
                    workItemsFoundInProject: 0,
                    searchKeyword: null
                };
            } else {
                workItemsOfType.workItems.forEach(workItem => {
                    //  Only show work items not yet included in the plan.
                    if (!this.props.epicsInPlan[workItem.WorkItemId]) {
                        items[workItem.WorkItemId] = {
                            id: workItem.WorkItemId,
                            key: workItem.WorkItemId,
                            text: workItem.Title,
                            workItemType: workItem.WorkItemType,
                            hide: false
                        };
                    }
                });

                projectItems[firstWorkItemTypeKey] = {
                    workItemTypeDisplayName: firstWorkItemType,
                    loadingStatus: LoadingStatus.Loaded,
                    loadingErrorMessage: null,
                    items,
                    workItemsFoundInProject: workItemsOfType.workItems.length,
                    searchKeyword: null
                };
            }

            this.setState({
                workItemsByLevel: projectItems,
                loadingProjectConfiguration: false,
                selectedProjectBacklogConfiguration: projectConfiguration,
                errorMessage: null
            });
        } catch (error) {
            errorMessage = JSON.stringify(error, null, "   ");
            console.log(errorMessage);
        } finally {
            this.setState({
                errorMessage,
                loadingProjectConfiguration: false
            });
        }
    };

    private _renderItemsForType = (workItemType: string): JSX.Element => {
        const { workItemsByLevel } = this.state;
        const workItemTypeKey = workItemType.toLowerCase();
        const content = workItemsByLevel[workItemTypeKey];

        //  No-op when LoadingStatus.NotLoaded, which means users has not clicked on the section yet to expand it.

        if (content.loadingStatus === LoadingStatus.Loading) {
            return <Spinner label="Loading work items..." size={SpinnerSize.large} className="loading-workitems" />;
        } else {
            if (content.loadingErrorMessage && content.loadingErrorMessage.length > 0) {
                return (
                    <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
                        {content.loadingErrorMessage}
                    </MessageBar>
                );
            } else if (content.workItemsFoundInProject === 0) {
                return (
                    <div className="workItemTypeEmptyMessage">
                        No work items of this type were found in the project.
                    </div>
                );
            } else if (Object.keys(content.items).length === 0) {
                return <div className="workItemTypeEmptyMessage">All work items were already added to the plan.</div>;
            } else {
                if (!this._selectionByWorkItemType[workItemTypeKey]) {
                    const selection = new Selection({
                        onSelectionChanged: () => this._onWorkItemSelectionChanged(workItemTypeKey)
                    });

                    this._selectionByWorkItemType[workItemTypeKey] = selection;
                }

                let allItemsCount: number = 0;
                const listItems: IAddItem[] = [];
                Object.keys(content.items).forEach(workItemId => {
                    const item = content.items[workItemId];
                    allItemsCount++;

                    if (item.hide === false) {
                        listItems.push(item);
                    }
                });

                const columns: IColumn[] = [
                    {
                        key: "titleColumn",
                        name: "Title",
                        fieldName: "text",
                        minWidth: 100,
                        maxWidth: 200,
                        isResizable: false,
                        isIconOnly: true
                    }
                ];

                const list: JSX.Element = (
                    <DetailsList
                        isHeaderVisible={false}
                        checkboxVisibility={CheckboxVisibility.hidden}
                        items={listItems}
                        columns={columns}
                        setKey="set"
                        onRenderItemColumn={this._onRenderItemColumn}
                        layoutMode={DetailsListLayoutMode.justified}
                        selection={this._selectionByWorkItemType[workItemTypeKey]}
                        selectionPreservedOnEmptyClick={true}
                        ariaLabelForSelectionColumn="Toggle selection"
                        ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                        checkButtonAriaLabel="Row checkbox"
                    />
                );

                /*
                const list: JSX.Element = (
                    <ScrollableList
                        className="item-list"
                        itemProvider={new ArrayItemProvider<IListBoxItem>(content.items)}
                        renderRow={this.renderRow}
                        selection={this._selectionByWorkItemType[workItemTypeKey]}
                        onSelect={this._onSelectionChanged}
                    />
                );
*/

                const searchFilter =
                    allItemsCount > AddItemPanel.WORKITEMTYPE_SEARCH_THRESHOLD
                        ? this._renderWorkItemTypeSectionFilter(workItemType)
                        : null;

                return (
                    <div className={"workItemTypeSectionBody"}>
                        {searchFilter}
                        {list}
                    </div>
                );
            }
        }
    };

    private _onRenderItemColumn = (item: IAddItem, index: number, column: IColumn): JSX.Element => {
        const workItemTypeKey = item.workItemType.toLowerCase();
        const iconProps = this.state.selectedProjectBacklogConfiguration.iconInfoByWorkItemType[workItemTypeKey];

        const imageProps: IImageProps = {
            src: iconProps.url,
            className: "workItemIconClass",
            imageFit: ImageFit.center,
            maximizeFrame: true
        };

        return (
            <div className="item-list-row">
                <Image {...imageProps as any} />
                <Tooltip overflowOnly={true}>
                    <span className="item-list-row-text">
                        {item.id} - {item.text}
                    </span>
                </Tooltip>
            </div>
        );
    };

    private _onWorkItemSelectionChanged = (workItemTypeKey: string) => {
        const { selectedWorkItems, workItemsByLevel } = this.state;
        const selection = this._selectionByWorkItemType[workItemTypeKey];
        const newSelectedWorkItems: { [workItemId: number]: IAddItem } = [];
        const workItemsInlevel = workItemsByLevel[workItemTypeKey];

        selection.getSelection().forEach(selectedWorkItem => {
            const workItemId: number = selectedWorkItem.key as number;
            newSelectedWorkItems[workItemId] = workItemsInlevel.items[workItemId];
        });

        if (Object.keys(newSelectedWorkItems).length === 0) {
            delete selectedWorkItems[workItemTypeKey];
        } else {
            selectedWorkItems[workItemTypeKey] = newSelectedWorkItems;
        }

        this.setState({
            selectedWorkItems
        });
    };

    private _renderWorkItemTypeSectionFilter = (workItemType: string): JSX.Element => {
        const searchKeyword = this.state.workItemsByLevel[workItemType].searchKeyword || "";

        return (
            <TextField
                value={searchKeyword}
                onChange={(e, value) => this._onFilter(e, value, workItemType)}
                placeholder={"Search keyword"}
                width={TextFieldWidth.auto}
                style={TextFieldStyle.inline}
                className={"searchTextField"}
            />
        );
    };

    private _onFilter = (
        ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        value: string,
        workItemType: string
    ): void => {
        const { workItemsByLevel } = this.state;

        const filterEnabled = value && value.length > 0;
        const valueLowerCase = value!.toLowerCase() || "";

        Object.keys(workItemsByLevel[workItemType].items).forEach(itemKey => {
            const item = workItemsByLevel[workItemType].items[itemKey] as IAddItem;
            item.hide = filterEnabled === true && item.text.toLowerCase().indexOf(valueLowerCase) === -1;
        });
        workItemsByLevel[workItemType].searchKeyword = value;

        this.setState({
            workItemsByLevel: workItemsByLevel
        });
    };

    private _renderEpics = () => {
        const { loadingProjectConfiguration, workItemsByLevel } = this.state;

        if (loadingProjectConfiguration) {
            return (
                <Spinner label="Loading Project Data..." size={SpinnerSize.large} className="loading-project-data" />
            );
        } else {
            const workItemTypeSections = Object.keys(workItemsByLevel).map(workItemTypeKey => {
                const content = workItemsByLevel[workItemTypeKey];

                return (
                    <CollapsiblePanel
                        contentKey={workItemTypeKey}
                        animate={false}
                        headerLabel={content.workItemTypeDisplayName}
                        headerClassName={"workItemTypeHeader"}
                        renderContent={this._renderItemsForType}
                        isCollapsible={true}
                        //  Initially expand sections loaded or currently loading.
                        initialIsExpanded={
                            content.loadingStatus === LoadingStatus.Loaded ||
                            content.loadingStatus === LoadingStatus.Loading
                        }
                        forceContentUpdate={content.loadingStatus === LoadingStatus.Loaded}
                        alwaysRenderContents={false}
                        onToggle={this._onWorkItemTypeToggle}
                    />
                );
            });

            return (
                <FormItem
                    message={this.state.errorMessage}
                    error={this.state.errorMessage && this.state.errorMessage !== ""}
                >
                    {workItemTypeSections}
                </FormItem>
            );
        }
    };

    private _onWorkItemTypeToggle = async (workItemTypeKey: string, isExpanded: boolean) => {
        PortfolioTelemetry.getInstance().TrackAction("AddItemPanel/WorkItemTypeToggle", {
            ["IsExpanded"]: isExpanded
        });
        const { selectedProject, workItemsByLevel } = this.state;

        const content = workItemsByLevel[workItemTypeKey];

        if (isExpanded && content.loadingStatus === LoadingStatus.NotLoaded) {
            //  Expanding for the first time, need to load work items.
            content.loadingStatus = LoadingStatus.Loading;

            this.setState({
                workItemsByLevel
            });

            //  Load work items for this type.
            let errorMessage: string = null;
            const items: { [workItemId: number]: IAddItem } = {};
            let workItemsFoundInProject = 0;

            try {
                const workItemsOfType = await PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
                    selectedProject.id,
                    content.workItemTypeDisplayName
                );

                if (workItemsOfType.exceptionMessage && workItemsOfType.exceptionMessage.length > 0) {
                    errorMessage = workItemsOfType.exceptionMessage;
                } else {
                    workItemsFoundInProject = workItemsOfType.workItems.length;

                    PortfolioTelemetry.getInstance().TrackAddItemPanelWorkItemsOfTypeCount(
                        selectedProject.id,
                        content.workItemTypeDisplayName,
                        workItemsFoundInProject
                    );

                    workItemsOfType.workItems.forEach(workItem => {
                        //  Only show work items not yet included in the plan.
                        if (!this.props.epicsInPlan[workItem.WorkItemId]) {
                            items[workItem.WorkItemId] = {
                                id: workItem.WorkItemId,
                                key: workItem.WorkItemId,
                                text: workItem.Title,
                                workItemType: workItemTypeKey,
                                hide: false
                            };
                        }
                    });
                }
            } catch (error) {
                errorMessage = JSON.stringify(error, null, "   ");
                console.log(errorMessage);
            } finally {
                content.loadingErrorMessage = errorMessage;
                content.items = items;
                content.workItemsFoundInProject = workItemsFoundInProject;
                content.loadingStatus = LoadingStatus.Loaded;

                this.setState({
                    workItemsByLevel
                });
            }
        }
    };

    /*
    private renderRow = (
        index: number,
        epic: IListBoxItem,
        details: IListItemDetails<IListBoxItem>,
        key?: string
    ): JSX.Element => {
        const itemData: IAddItem = epic.data as IAddItem;
        const workItemTypeKey = itemData.workItemType.toLowerCase();

        if (!this._indexToWorkItemIdMap[workItemTypeKey]) {
            this._indexToWorkItemIdMap[workItemTypeKey] = {};
        }

        this._indexToWorkItemIdMap[workItemTypeKey][index] = Number(epic.id);
        this._workItemIdMap[itemData.id] = itemData;

        if (itemData.hide === true) {
            //  Don't render this row, as it has been filtered out by search.
            return null;
        }
        const iconProps = this.state.selectedProjectBacklogConfiguration.iconInfoByWorkItemType[workItemTypeKey];

        const imageProps: IImageProps = {
            src: iconProps.url,
            className: "workItemIconClass",
            imageFit: ImageFit.center,
            maximizeFrame: true
        };

        return (
            <ListItem key={key || "list-item" + index} index={index} details={details}>
                <div className="item-list-row">
                    <Image {...imageProps as any} />
                    <Tooltip overflowOnly={true}>
                        <span className="item-list-row-text">
                            {epic.id} - {epic.text}
                        </span>
                    </Tooltip>
                </div>
            </ListItem>
        );
    };
*/
    /*
    private _onSelectionChanged = (event: React.SyntheticEvent<HTMLElement>, listRow: IListRow<IListBoxItem>) => {
        const newSelectedEpics: { [workItemId: number]: IAddItem } = [];
        const selectedIndexes: number[] = [];
        const rowData: IAddItem = listRow.data.data as IAddItem;
        const workItemTypeKey = rowData.workItemType.toLowerCase();
        const { selectedWorkItems } = this.state;

        this._selectionByWorkItemType[workItemTypeKey].value.forEach(selectedGroup => {
            for (let index = selectedGroup.beginIndex; index <= selectedGroup.endIndex; index++) {
                selectedIndexes.push(index);
            }
        });

        selectedIndexes.forEach(index => {
            const workItemId = this._indexToWorkItemIdMap[workItemTypeKey][index];
            newSelectedEpics[workItemId] = this._workItemIdMap[workItemId];
        });

        if (Object.keys(newSelectedEpics).length === 0) {
            delete selectedWorkItems[workItemTypeKey];
        } else {
            selectedWorkItems[workItemTypeKey] = newSelectedEpics;
        }

        this.setState({
            selectedWorkItems
        });
    };
*/

    private _onAddEpics = (): void => {
        const items: IAddItem[] = [];

        Object.keys(this.state.selectedWorkItems).forEach(wiTypeKey => {
            const workItemsInType = this.state.selectedWorkItems[wiTypeKey];

            Object.keys(workItemsInType).forEach(workItem => {
                items.push(workItemsInType[workItem]);
            });
        });

        this.props.onAddItems({
            planId: this.props.planId,
            projectId: this.state.selectedProject.id,
            items,
            projectConfiguration: this.state.selectedProjectBacklogConfiguration
        });

        this.props.onCloseAddItemPanel();
    };

    private _getAllProjects = async (): Promise<Project[]> => {
        const projects = await PortfolioPlanningDataService.getInstance().getAllProjects();
        return projects.projects;
    };

    private _getProjectConfiguration = async (projectId: string): Promise<IProjectConfiguration> => {
        const projectIdKey = projectId.toLowerCase();
        let result: IProjectConfiguration = this._projectConfigurationsCache[projectIdKey];

        if (!result) {
            result = await ProjectConfigurationDataService.getInstance().getProjectConfiguration(projectId);
            this._projectConfigurationsCache[projectIdKey] = result;
        }

        return result;
    };
}
