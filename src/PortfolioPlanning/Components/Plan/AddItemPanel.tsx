import * as React from "react";
import "./AddItemPanel.scss";
import { Project, WorkItem } from "../../Models/PortfolioPlanningQueryModels";
import { IEpic, IProject, IAddItems } from "../../Contracts";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
import { Panel } from "azure-devops-ui/Panel";
import { Dropdown, DropdownCallout } from "azure-devops-ui/Dropdown";
import { Location } from "azure-devops-ui/Utilities/Position";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { ListSelection, ScrollableList, ListItem, IListItemDetails, IListRow } from "azure-devops-ui/List";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ProjectBacklogConfiguration, ProjectBacklogConfiguration2 } from "../../Models/ProjectBacklogModels";
import {
    BacklogConfigurationDataService,
    BacklogConfigurationDataService2
} from "../../Common/Services/BacklogConfigurationDataService";
import { FormItem } from "azure-devops-ui/FormItem";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";

export interface IAddItemPanelProps {
    planId: string;
    epicsInPlan: { [epicId: number]: number };
    onCloseAddItemPanel: () => void;
    onAddItems: (itemsToAdd: IAddItems) => void;
}

interface IAddItemPanelState {
    epicsToAdd: IEpic[];
    projects: IListBoxItem[];
    selectedProject: IProject;
    selectedProjectBacklogConfiguration: ProjectBacklogConfiguration2;
    epics: IListBoxItem[];
    selectedEpics: number[];
    epicsLoaded: boolean;
    loadingProjects: boolean;
    loadingEpics: boolean;
    errorMessage: string;
}

export class AddItemPanel extends React.Component<IAddItemPanelProps, IAddItemPanelState> {
    private selection = new ListSelection(true);
    private _indexToWorkItemIdMap: { [index: number]: number } = {};

    constructor(props) {
        super(props);
        this.state = {
            epicsToAdd: [],
            projects: [],
            selectedProject: null,
            selectedProjectBacklogConfiguration: null,
            epics: [],
            selectedEpics: [],
            epicsLoaded: false,
            loadingProjects: true,
            loadingEpics: false,
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
                        disabled: this.state.selectedEpics.length === 0
                    }
                ]}
            >
                <div className="add-item-panel-container">
                    {this._renderProjectPicker()}
                    {this._renderEpics()}
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
                        onSelect={this.onSelect}
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

    private onSelect = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        this.setState({
            selectedProject: {
                id: item.id,
                title: item.text
            },
            loadingEpics: true
        });

        this._getEpicsInProject(item.id).then(
            epics => {
                const allEpics: IListBoxItem[] = [];
                epics.workItems.forEach(epic => {
                    //  Only show Epics not yet included in the plan.
                    if (!this.props.epicsInPlan[epic.WorkItemId]) {
                        allEpics.push({
                            id: epic.WorkItemId.toString(),
                            text: epic.Title
                        });
                    }
                });
                this.setState({
                    epics: allEpics,
                    epicsLoaded: true,
                    loadingEpics: false,
                    selectedProjectBacklogConfiguration: epics.projectBacklogConfig,
                    errorMessage: ""
                });
            },
            error =>
                this.setState({
                    errorMessage: JSON.stringify(error, null, "   "),
                    loadingEpics: false
                })
        );
    };

    private _renderEpics = () => {
        const { loadingEpics, epicsLoaded } = this.state;

        if (loadingEpics) {
            return <Spinner label="Loading Epics..." size={SpinnerSize.large} className="loading-epics" />;
        } else if (epicsLoaded) {
            return (
                <FormItem message={this.state.errorMessage} error={this.state.errorMessage !== ""}>
                    <div className="epics-label">Epics</div>
                    {this.state.epics.length > 0 ? (
                        <ScrollableList
                            className="item-list"
                            itemProvider={new ArrayItemProvider<IListBoxItem>(this.state.epics)}
                            renderRow={this.renderRow}
                            selection={this.selection}
                            onSelect={this._onSelectionChanged}
                        />
                    ) : (
                        <div>All epics are already added to plan.</div>
                    )}
                </FormItem>
            );
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
                    {epic.id} - {epic.text}
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

        this.setState({
            selectedEpics: newSelectedEpics
        });
    };

    private _onAddEpics = (): void => {
        this.props.onAddItems({
            planId: this.props.planId,
            projectId: this.state.selectedProject.id,
            itemIdsToAdd: this.state.selectedEpics,
            workItemType: this.state.selectedProjectBacklogConfiguration.defaultEpicWorkItemType,
            requirementWorkItemType: this.state.selectedProjectBacklogConfiguration.defaultRequirementWorkItemType,
            effortWorkItemFieldRefName: this.state.selectedProjectBacklogConfiguration.effortFieldRefName
        });

        this.props.onCloseAddItemPanel();
    };

    private _getAllProjects = async (): Promise<Project[]> => {
        const projects = await PortfolioPlanningDataService.getInstance().getAllProjects();
        return projects.projects;
    };

    private _getEpicsInProject = async (
        projectId: string
    ): Promise<{ workItems: WorkItem[]; projectBacklogConfig: ProjectBacklogConfiguration2 }> => {
        const projectConfig = await BacklogConfigurationDataService2.getInstance().getProjectBacklogConfiguration(
            projectId
        );

        const epics = await PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
            projectId,
            projectConfig.defaultEpicWorkItemType
        );

        return {
            workItems: epics.workItems,
            projectBacklogConfig: projectConfig
        };
    };
}
