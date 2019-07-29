import * as React from "react";
import "./AddItemPanel.scss";
import { Project } from "../../Models/PortfolioPlanningQueryModels";
import {
    IWorkItem,
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
import { ListSelection, ScrollableList, ListItem, IListItemDetails, IListRow } from "azure-devops-ui/List";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { FormItem } from "azure-devops-ui/FormItem";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { CollapsiblePanel } from "../../Common/Components/CollapsiblePanel";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { ProjectConfigurationDataService } from "../../Common/Services/ProjectConfigurationDataService";
import { Image, IImageProps, ImageFit } from "office-ui-fabric-react/lib/Image";

export interface IAddItemPanelProps {
    planId: string;
    epicsInPlan: { [epicId: number]: number };
    onCloseAddItemPanel: () => void;
    onAddItems: (itemsToAdd: IAddItems) => void;
}

interface IAddItemPanelState {
    epicsToAdd: IWorkItem[];
    projects: IListBoxItem[];
    selectedProject: IProject;
    selectedProjectBacklogConfiguration: IProjectConfiguration;
    /**
     * Map of work items to display, grouped by backlog level.
     */
    workItemsByLevel: IAddItemPanelProjectItems;

    selectedWorkItems: { [workItemTypeKey: string]: { [workItemId: number]: IAddItem } };
    loadingProjects: boolean;
    loadingProjectConfiguration: boolean;
    errorMessage: string;
}

export class AddItemPanel extends React.Component<IAddItemPanelProps, IAddItemPanelState> {
    private _selectionByWorkItemType: { [workItemTypeKey: string]: ListSelection } = {};
    private _indexToWorkItemIdMap: { [workItemTypeKey: string]: { [index: number]: number } } = {};
    private _workItemIdMap: { [index: number]: IAddItem } = {};
    private _projectConfigurationsCache: { [projectIdKey: string]: IProjectConfiguration } = {};

    constructor(props) {
        super(props);
        this.state = {
            epicsToAdd: [],
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
        this._workItemIdMap = {};
        this._indexToWorkItemIdMap = {};

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
            const firstWorkItemType = projectConfiguration.orderedWorkItemTypes[0];
            const firstWorkItemTypeKey = firstWorkItemType.toLowerCase();
            const workItemsOfType = await PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
                item.id,
                firstWorkItemType
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
                    workItemsFoundInProject: 0
                };
            });

            //  Populating work items for first type.
            const items: IListBoxItem[] = [];
            if (workItemsOfType.exceptionMessage && workItemsOfType.exceptionMessage.length > 0) {
                projectItems[firstWorkItemTypeKey] = {
                    workItemTypeDisplayName: firstWorkItemType,
                    loadingStatus: LoadingStatus.Loaded,
                    loadingErrorMessage: workItemsOfType.exceptionMessage,
                    items: null,
                    workItemsFoundInProject: 0
                };
            } else {
                workItemsOfType.workItems.forEach(workItem => {
                    //  Only show work items not yet included in the plan.
                    if (!this.props.epicsInPlan[workItem.WorkItemId]) {
                        const itemData: IAddItem = {
                            id: workItem.WorkItemId,
                            workItemType: workItem.WorkItemType
                        };

                        items.push({
                            id: workItem.WorkItemId.toString(),
                            text: workItem.Title,
                            data: itemData
                        });
                    }
                });

                projectItems[firstWorkItemTypeKey] = {
                    workItemTypeDisplayName: firstWorkItemType,
                    loadingStatus: LoadingStatus.Loaded,
                    loadingErrorMessage: null,
                    items,
                    workItemsFoundInProject: workItemsOfType.workItems.length
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
            } else if (content.items.length === 0) {
                return <div className="workItemTypeEmptyMessage">All work items are already added to plan.</div>;
            } else {
                if (!this._selectionByWorkItemType[workItemTypeKey]) {
                    this._selectionByWorkItemType[workItemTypeKey] = new ListSelection(true);
                }

                return (
                    <ScrollableList
                        className="item-list"
                        itemProvider={new ArrayItemProvider<IListBoxItem>(content.items)}
                        renderRow={this.renderRow}
                        selection={this._selectionByWorkItemType[workItemTypeKey]}
                        onSelect={this._onSelectionChanged}
                    />
                );
            }
        }
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
                <FormItem message={this.state.errorMessage} error={this.state.errorMessage !== ""}>
                    {workItemTypeSections}
                </FormItem>
            );
        }
    };

    private _onWorkItemTypeToggle = async (workItemTypeKey: string, isExpanded: boolean) => {
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
            let items: IListBoxItem[] = [];
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

                    workItemsOfType.workItems.forEach(workItem => {
                        //  Only show work items not yet included in the plan.
                        if (!this.props.epicsInPlan[workItem.WorkItemId]) {
                            const itemData: IAddItem = {
                                id: workItem.WorkItemId,
                                workItemType: workItemTypeKey
                            };

                            items.push({
                                id: workItem.WorkItemId.toString(),
                                text: workItem.Title,
                                data: itemData
                            });
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
                    <span>
                        {epic.id} - {epic.text}
                    </span>
                </div>
            </ListItem>
        );
    };

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
