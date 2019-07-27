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
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { BacklogConfigurationDataService } from "../../Common/Services/BacklogConfigurationDataService";

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

    selectedWorkItems: { [workItemId: number]: IAddItem };
    loadingProjects: boolean;
    loadingProjectConfiguration: boolean;
    errorMessage: string;
}

export class AddItemPanel extends React.Component<IAddItemPanelProps, IAddItemPanelState> {
    private selection = new ListSelection(true);
    private _indexToWorkItemIdMap: { [index: number]: number } = {};
    private _projectConfigurationsCache: { [projectIdKey: string]: IProjectConfiguration } = {};

    constructor(props) {
        super(props);
        this.state = {
            epicsToAdd: [],
            projects: [],
            selectedProject: null,
            selectedProjectBacklogConfiguration: null,
            workItemsByLevel: {},
            selectedWorkItems: [],
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
                    <div>{this._renderEpics2()}</div>
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
                <FormItem message={this.state.errorMessage} error={this.state.errorMessage !== ""}>
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
        this.setState({
            selectedProject: {
                id: item.id,
                title: item.text
            },
            loadingProjectConfiguration: true
        });

        let errorMessage: string = null;

        try {
            const projectBacklogConfiguration = await this._getProjectConfiguration(item.id);
            const firstWorkItemType = projectBacklogConfiguration.orderedWorkItemTypes[0];
            const firstWorkItemTypeKey = firstWorkItemType.toLowerCase();
            const workItemsOfType = await PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
                item.id,
                firstWorkItemType
            );

            const projectItems: IAddItemPanelProjectItems = {};

            //  Adding all work item types in project.
            projectBacklogConfiguration.orderedWorkItemTypes.forEach(wiType => {
                const wiTypeKey = wiType.toLowerCase();
                projectItems[wiTypeKey] = {
                    workItemTypeDisplayName: wiType,
                    loadingStatus: LoadingStatus.Loaded,
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
                        items.push({
                            id: workItem.WorkItemId.toString(),
                            text: workItem.Title,
                            iconProps: {
                                iconName: workItem.WorkItemIconName,
                                size: IconSize.small,
                                style: {
                                    color: `#${workItem.WorkItemColor}`
                                }
                            }
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
                selectedProjectBacklogConfiguration: projectBacklogConfiguration,
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
                return <div>No work items of this type were found in the project.</div>;
            } else if (content.items.length === 0) {
                return <div>All work items are already added to plan.</div>;
            } else {
                return (
                    <ScrollableList
                        className="item-list"
                        itemProvider={new ArrayItemProvider<IListBoxItem>(content.items)}
                        renderRow={this.renderRow}
                        selection={this.selection}
                        onSelect={this._onSelectionChanged}
                    />
                );
            }
        }
    };

    private _renderEpics2 = () => {
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
            let items: IListBoxItem[] = null;
            let workItemsFoundInProject = 0;

            try {
                const workItemsOfType = await PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
                    selectedProject.id,
                    content.workItemTypeDisplayName
                );

                if (workItemsOfType.exceptionMessage && workItemsOfType.exceptionMessage.length > 0) {
                    errorMessage = workItemsOfType.exceptionMessage;
                } else {
                    workItemsOfType.workItems.forEach(workItem => {
                        //  Only show work items not yet included in the plan.
                        if (!this.props.epicsInPlan[workItem.WorkItemId]) {
                            items.push({
                                id: workItem.WorkItemId.toString(),
                                text: workItem.Title,
                                iconProps: {
                                    iconName: workItem.WorkItemIconName,
                                    size: IconSize.small,
                                    style: {
                                        color: `#${workItem.WorkItemColor}`
                                    }
                                }
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
        this._indexToWorkItemIdMap[index] = Number(epic.id);
        return (
            <ListItem key={key || "list-item" + index} index={index} details={details}>
                <div className="item-list-row">
                    <Icon
                        ariaLabel="Video icon"
                        iconName={epic.iconProps.iconName}
                        style={{ color: epic.iconProps.style.color }}
                        size={epic.iconProps.size}
                    />;
                    <span>
                        {epic.id} - {epic.text}
                    </span>
                </div>
            </ListItem>
        );
    };

    private _onSelectionChanged = (event: React.SyntheticEvent<HTMLElement>, listRow: IListRow<IListBoxItem>) => {
        let newSelectedEpics: number[] = [];
        const selectedIndexes: number[] = [];

        this.selection.value.forEach(selectedGroup => {
            for (let index = selectedGroup.beginIndex; index <= selectedGroup.endIndex; index++) {
                selectedIndexes.push(index);
            }
        });

        selectedIndexes.forEach(index => {
            newSelectedEpics.push(this._indexToWorkItemIdMap[index]);
        });
        //  TODO    Fix selection changes.
        /*
        this.setState({
            selectedWorkItems: newSelectedEpics
        });
        */
    };

    private _onAddEpics = (): void => {
        const items: IAddItem[] = Object.keys(this.state.selectedWorkItems).map(
            wiKey => this.state.selectedWorkItems[wiKey]
        );

        this.props.onAddItems({
            planId: this.props.planId,
            projectId: this.state.selectedProject.id,
            items,
            projectBacklogConfiguration: this.state.selectedProjectBacklogConfiguration
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
            result = await BacklogConfigurationDataService.getInstance().getProjectBacklogConfiguration(projectId);
            this._projectConfigurationsCache[projectIdKey] = result;
        }

        return result;
    };
}
