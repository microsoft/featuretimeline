import * as React from "react";
import { Panel } from "azure-devops-ui/Panel";
import "./DependencyPanel.scss";
import {
    ITimelineItem,
    LoadingStatus,
    ProgressTrackingCriteria,
    IWorkItemIcon,
    IProject,
    IProjectConfiguration
} from "../../Contracts";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
import { BacklogConfigurationDataService } from "../../Common/Services/BacklogConfigurationDataService";
import {
    PortfolioPlanningDependencyQueryResult,
    PortfolioPlanningQueryResultItem
} from "../../Models/PortfolioPlanningQueryModels";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { CollapsiblePanel } from "../../Common/Components/CollapsiblePanel";
import { ScrollableList, IListItemDetails, ListItem } from "azure-devops-ui/List";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { ProgressDetails } from "../../Common/Components/ProgressDetails";
import { Image, ImageFit, IImageProps } from "office-ui-fabric-react/lib/Image";
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";
import { connect } from "react-redux";
import { Icon } from "azure-devops-ui/Icon";
import moment = require("moment");

type WorkItemIconMap = { [projectIdKey: string]: { [workItemType: string]: IWorkItemIcon } };
type WorkItemInProgressStatesMap = { [WorkItemType: string]: string[] };
export interface IDependencyPanelProps {
    workItem: ITimelineItem;
    projectInfo: IProject;
    progressTrackingCriteria: ProgressTrackingCriteria;
    onDismiss: () => void;
}

export interface IDependencyPanelState {
    loading: LoadingStatus;
    errorMessage: string;
    predecessors: PortfolioPlanningQueryResultItem[];
    successors: PortfolioPlanningQueryResultItem[];
    workItemIcons: WorkItemIconMap;
    workItemTypeMappedStatesInProgress: WorkItemInProgressStatesMap;
}

interface IDependencyItemRenderData {
    projectId: string;
    workItemType: string;
    completed: number;
    total: number;
    showInfoIcon: boolean;
    infoMessage: string;
}

export class DependencyPanel extends React.Component<IDependencyPanelProps, IDependencyPanelState> {
    constructor(props) {
        super(props);

        this.state = {
            loading: LoadingStatus.NotLoaded,
            predecessors: [],
            successors: [],
            workItemIcons: {},
            errorMessage: "",
            workItemTypeMappedStatesInProgress: {}
        };

        this._getWorkItemTypeMappedStatesInProgress().then(
            workItemTypeMappedStatesInProgress => {
                this._getDependencies().then(
                    dependencies => {
                        let Predecessors: PortfolioPlanningQueryResultItem[] = [];
                        let Successors: PortfolioPlanningQueryResultItem[] = [];
                        const newWorkItemIconMap: WorkItemIconMap = {};
                        const allPromises: Promise<WorkItemIconMap>[] = [];

                        Object.keys(dependencies.byProject).forEach(projectIdKey => {
                            let {
                                Predecessors: ProjectPredecessors,
                                Successors: ProjectSuccessors
                            } = dependencies.byProject[projectIdKey];
                            const projectConfiguration = dependencies.targetsProjectConfiguration[projectIdKey];

                            Predecessors = Predecessors.concat(ProjectPredecessors);
                            Successors = Successors.concat(ProjectSuccessors);

                            allPromises.push(
                                this._getWorkItemIcons(ProjectPredecessors, ProjectSuccessors, projectConfiguration)
                            );
                        });

                        Promise.all(allPromises).then(
                            allResults => {
                                allResults.forEach(res => {
                                    Object.keys(res).forEach(projectIdKey => {
                                        if (!newWorkItemIconMap[projectIdKey]) {
                                            newWorkItemIconMap[projectIdKey] = {};
                                        }

                                        Object.keys(res[projectIdKey]).forEach(workItemTypeKey => {
                                            const icon: IWorkItemIcon = res[projectIdKey][workItemTypeKey];

                                            if (!newWorkItemIconMap[projectIdKey][workItemTypeKey]) {
                                                newWorkItemIconMap[projectIdKey][workItemTypeKey] = icon;
                                            }
                                        });
                                    });
                                });

                                //  Sort items from all projects by target date.
                                Predecessors.sort((a, b) => (a.TargetDate > b.TargetDate ? 1 : -1));
                                Successors.sort((a, b) => (a.TargetDate > b.TargetDate ? 1 : -1));

                                this.setState({
                                    loading: LoadingStatus.Loaded,
                                    predecessors: Predecessors,
                                    successors: Successors,
                                    workItemIcons: newWorkItemIconMap,
                                    errorMessage: dependencies.exceptionMessage,
                                    workItemTypeMappedStatesInProgress: workItemTypeMappedStatesInProgress
                                });
                            },
                            error => {
                                this.setState({ errorMessage: error.message, loading: LoadingStatus.NotLoaded });
                                return null;
                            }
                        );
                    },
                    error => {
                        this.setState({ errorMessage: error.message, loading: LoadingStatus.NotLoaded });
                    }
                );
            },
            error => {
                this.setState({ errorMessage: error.message, loading: LoadingStatus.NotLoaded });
            }
        );
    }

    private _getWorkItemIcons = async (
        Predecessors: PortfolioPlanningQueryResultItem[],
        Successors: PortfolioPlanningQueryResultItem[],
        configuration: IProjectConfiguration
    ): Promise<WorkItemIconMap> => {
        const projectIdKey = configuration.id.toLowerCase();

        let result: WorkItemIconMap = {
            [projectIdKey]: { ...configuration.iconInfoByWorkItemType }
        };

        const missingWorkItemTypes: { [workItemTypeKey: string]: boolean } = {};
        const allPromises: Promise<IWorkItemIcon>[] = [];

        Predecessors.concat(Successors).forEach(item => {
            const workItemTypeKey = item.WorkItemType.toLowerCase();

            if (!configuration.iconInfoByWorkItemType[workItemTypeKey] && !missingWorkItemTypes[workItemTypeKey]) {
                missingWorkItemTypes[workItemTypeKey] = true;
                allPromises.push(
                    BacklogConfigurationDataService.getInstance().getWorkItemTypeIconInfo(projectIdKey, workItemTypeKey)
                );
            }
        });

        if (allPromises.length > 0) {
            const missingIcons = await Promise.all(allPromises);
            missingIcons.forEach(missingIcon => {
                const workItemTypeKey = missingIcon.workItemType.toLowerCase();

                if (!result[projectIdKey][workItemTypeKey]) {
                    result[projectIdKey][workItemTypeKey] = missingIcon;
                }
            });
        }

        return result;
    };

    public render(): JSX.Element {
        // TODO: Add red ! icon to indicate problems
        // TODO: Dependencies should probably be links
        return (
            <Panel
                onDismiss={this.props.onDismiss}
                titleProps={{ text: `Dependencies for ${this.props.workItem.title}` }}
                footerButtonProps={[
                    {
                        text: "Close",
                        primary: true,
                        onClick: this.props.onDismiss
                    }
                ]}
            >
                <div className="dependency-panel">{this._renderDependencies()}</div>
            </Panel>
        );
    }

    private _renderDependencies(): JSX.Element {
        if (this.state.errorMessage) {
            return <MessageCard severity={MessageCardSeverity.Error}>{this.state.errorMessage}</MessageCard>;
        } else if (this.state.loading != LoadingStatus.Loaded) {
            return <Spinner label="Loading dependencies..." size={SpinnerSize.large} className="loading-spinner" />;
        } else {
            return (
                <>
                    <CollapsiblePanel
                        contentKey="depends-on"
                        animate={false}
                        headerLabel="Waiting for others"
                        headerClassName={"list-header"}
                        renderContent={(key: string) => this._renderDependencyGroup(this.state.predecessors, true)}
                        isCollapsible={true}
                        initialIsExpanded={true}
                        forceContentUpdate={true}
                        alwaysRenderContents={false}
                    />
                    <CollapsiblePanel
                        contentKey="has-dependency"
                        animate={false}
                        headerLabel="Others waiting on"
                        headerClassName={"list-header"}
                        renderContent={(key: string) => this._renderDependencyGroup(this.state.successors, false)}
                        isCollapsible={true}
                        initialIsExpanded={true}
                        forceContentUpdate={true}
                        alwaysRenderContents={false}
                    />
                </>
            );
        }
    }

    private _renderDependencyGroup = (dependencies: PortfolioPlanningQueryResultItem[], isPredecessor): JSX.Element => {
        const items: IListBoxItem<IDependencyItemRenderData>[] = [];

        if (dependencies.length === 0) {
            return <div className="empty-group-message">No dependencies found.</div>;
        }

        dependencies.forEach(dependency => {
            items.push({
                id: dependency.WorkItemId.toString(),
                text: dependency.Title,
                data: {
                    projectId: dependency.ProjectId,
                    workItemType: dependency.WorkItemType,
                    completed:
                        this.props.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount
                            ? dependency.CompletedCount
                            : dependency.CompletedEffort,
                    total:
                        this.props.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount
                            ? dependency.TotalCount
                            : dependency.TotalEffort,
                    showInfoIcon: this._showInfoIcon(dependency, isPredecessor),
                    infoMessage: isPredecessor
                        ? "Target date is later than " + this.props.workItem.title + "'s start date"
                        : "Start date is earlier than " + this.props.workItem.title + "'s target date"
                }
            });
        });

        return (
            <ScrollableList
                className="item-list"
                itemProvider={new ArrayItemProvider<IListBoxItem<IDependencyItemRenderData>>(items)}
                renderRow={this._renderDependencyItem}
            />
        );
    };

    private _showInfoIcon = (item: PortfolioPlanningQueryResultItem, isPredecessor: boolean): boolean => {
        // only show info icon if the item is in InProgress state.
        const statesForInProgress = this.state.workItemTypeMappedStatesInProgress[item.WorkItemType.toLowerCase()];
        if (statesForInProgress.indexOf(item.State) === -1) return false;

        // if this depends-on item has end date later than selected work item's start date.
        if (moment(item.TargetDate) > this.props.workItem.start_time && isPredecessor) {
            return true;
        }
        // if this has-dependency item has start date earlier than selected work item's end date.
        if (moment(item.StartDate) < this.props.workItem.end_time && !isPredecessor) {
            return true;
        }
        return false;
    };

    private _renderDependencyItem = (
        index: number,
        item: IListBoxItem<IDependencyItemRenderData>,
        details: IListItemDetails<IListBoxItem<IDependencyItemRenderData>>,
        key?: string
    ): JSX.Element => {
        const workItemTypeKey = item.data.workItemType.toLowerCase();
        const projectIdKey = item.data.projectId.toLowerCase();
        let imageUrl: string = null;

        if (this.state.workItemIcons[projectIdKey] && this.state.workItemIcons[projectIdKey][workItemTypeKey]) {
            imageUrl = this.state.workItemIcons[projectIdKey]![workItemTypeKey]!.url;
        }

        const imageProps: IImageProps = {
            src: imageUrl,
            className: "item-list-icon",
            imageFit: ImageFit.center,
            maximizeFrame: true
        };

        return (
            <ListItem key={key || item.id} index={index} details={details}>
                <div className="item-list-row">
                    {item.data.showInfoIcon ? (
                        <Tooltip text={item.data.infoMessage}>
                            <div>
                                <Icon ariaLabel="Info icon" iconName="Info" className="info-icon" />
                            </div>
                        </Tooltip>
                    ) : null}
                    <Image {...imageProps as any} />
                    <div className="item-text-and-progress">
                        <Tooltip overflowOnly={true}>
                            <span className="item-text">
                                {item.id} - {item.text}
                            </span>
                        </Tooltip>
                        <div className="item-progress">
                            <ProgressDetails
                                completed={item.data.completed}
                                total={item.data.total}
                                onClick={() => {}}
                            />
                        </div>
                    </div>
                </div>
            </ListItem>
        );
    };

    private _getDependencies = async (): Promise<PortfolioPlanningDependencyQueryResult> => {
        const dependencies = await PortfolioPlanningDataService.getInstance().runDependencyQuery({
            workItemIds: [this.props.workItem.id]
        });

        return dependencies;
    };

    private _getWorkItemTypeMappedStatesInProgress = async (): Promise<WorkItemInProgressStatesMap> => {
        const workItemTypeMappedStatesInProgress = await BacklogConfigurationDataService.getInstance().getInProgressStates(
            this.props.projectInfo.id
        );
        return workItemTypeMappedStatesInProgress;
    };
}

const mapStateToProps = (state: IDependencyPanelState, ownProps: IDependencyPanelProps) => ({
    workItem: ownProps.workItem,
    progressTrackingCriteria: ownProps.progressTrackingCriteria,
    onDismiss: ownProps.onDismiss
});

export const ConnectedDependencyPanel = connect(mapStateToProps)(DependencyPanel);
