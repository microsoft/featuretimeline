import * as React from "react";
import { Panel } from "azure-devops-ui/Panel";
import "./DependencyPanel.scss";
import { ITimelineItem, LoadingStatus, ProgressTrackingCriteria, IWorkItemIcon, IProject } from "../../Contracts";
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
import { launchWorkItemForm } from "../../../../src/common/redux/actions/launchWorkItemForm";
import { connect } from 'react-redux';
import { Icon } from "azure-devops-ui/Icon";
import moment = require("moment");
import { Link } from "office-ui-fabric-react/lib/Link";

type WorkItemIconMap = { [workItemType: string]: IWorkItemIcon };
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

export class DependencyPanel extends React.Component<IDependencyPanelProps & typeof Actions, IDependencyPanelState> {
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

        this._getDependencies().then(
            dependencies => {
                const projectIdKey = this.props.projectInfo.id.toLowerCase();
                const { configuration } = this.props.projectInfo;
                let Predecessors: PortfolioPlanningQueryResultItem[] = [];
                let Successors: PortfolioPlanningQueryResultItem[] = [];

                if (dependencies && dependencies.byProject[projectIdKey]) {
                    Predecessors = dependencies.byProject[projectIdKey].Predecessors;
                    Successors = dependencies.byProject[projectIdKey].Successors;
                }

                this.setState({
                    loading: LoadingStatus.Loaded,
                    predecessors: Predecessors,
                    successors: Successors,
                    workItemIcons: configuration.iconInfoByWorkItemType,
                    errorMessage: dependencies.exceptionMessage
                });
            },
            error => {
                this.setState({ errorMessage: error.message, loading: LoadingStatus.NotLoaded });
            }
        );

        this._getWorkItemTypeMappedStatesInProgress().then(
            workItemTypeMappedStatesInProgress => {
                this.setState({
                    workItemTypeMappedStatesInProgress: workItemTypeMappedStatesInProgress
                });
            },
            error => {
                this.setState({ errorMessage: error.message, loading: LoadingStatus.NotLoaded });
            }
        );
    }

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
        const imageProps: IImageProps = {
            src: this.state.workItemIcons[workItemTypeKey].url,
            className: "item-list-icon",
            imageFit: ImageFit.center,
            maximizeFrame: true
        };

        return (
            <ListItem key={key || item.id} index={index} details={details}>
                <div className="item-list-row" >
                    {item.data.showInfoIcon ? (
                        <Tooltip text={item.data.infoMessage}>
                            <div>
                                <Icon ariaLabel="Info icon" iconName="Info" className="info-icon" />
                            </div>
                        </Tooltip>
                    ) : null}
                    <Image {...imageProps as any} />
                    <div className="item-text-and-progress" >
                        <Tooltip overflowOnly={true} >
                            <Link className="item-text" onClick={() => this.props.openWIForm(parseInt(item.id))}>
                                {item.id} - {item.text}
                            </Link>
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
        const { id, configuration } = this.props.projectInfo;
        const dependencies = await PortfolioPlanningDataService.getInstance().runDependencyQuery({
            [id.toLowerCase()]: {
                workItemIds: [this.props.workItem.id],
                projectConfiguration: configuration
            }
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
    workItem : ownProps.workItem, 
    progressTrackingCriteria: ownProps.progressTrackingCriteria, 
    onDismiss: ownProps.onDismiss
});

const Actions = { openWIForm: launchWorkItemForm };

export const ConnectedDependencyPanel =  connect (mapStateToProps, Actions)(DependencyPanel);