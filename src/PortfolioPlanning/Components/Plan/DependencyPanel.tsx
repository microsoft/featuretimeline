import * as React from "react";
import { Panel } from "azure-devops-ui/Panel";
import "./DependencyPanel.scss";
import { ITimelineItem, LoadingStatus, ProgressTrackingCriteria, IWorkItemIcon } from "../../Contracts";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
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

type WorkItemIconMap = { [projectId: string]: { [workItemType: string]: IWorkItemIcon } };

export interface IDependencyPanelProps {
    workItem: ITimelineItem;
    progressTrackingCriteria: ProgressTrackingCriteria;
    onDismiss: () => void;
}

export interface IDependencyPanelState {
    loading: LoadingStatus;
    errorMessage: string;
    dependsOn: PortfolioPlanningQueryResultItem[];
    hasDependency: PortfolioPlanningQueryResultItem[];
    workItemIcons: WorkItemIconMap;
}

interface IDependencyItemRenderData {
    projectId: string;
    workItemType: string;
    completed: number;
    total: number;
}

export class DependencyPanel extends React.Component<IDependencyPanelProps, IDependencyPanelState> {
    constructor(props) {
        super(props);

        this.state = {
            loading: LoadingStatus.NotLoaded,
            dependsOn: [],
            hasDependency: [],
            workItemIcons: {},
            errorMessage: ""
        };

        this._getDependencies().then(
            dependencies => {
                this._getWorkItemIcons(dependencies.DependsOn.concat(dependencies.HasDependency)).then(
                    workItemIcons => {
                        this.setState({
                            loading: LoadingStatus.Loaded,
                            dependsOn: dependencies.DependsOn,
                            hasDependency: dependencies.HasDependency,
                            workItemIcons: workItemIcons
                        });
                    }
                );
            },
            error => {
                this.setState({ errorMessage: JSON.stringify(error), loading: LoadingStatus.NotLoaded });
            }
        );
    }

    public render(): JSX.Element {
        return (
            <Panel
                onDismiss={this.props.onDismiss}
                showSeparator={true}
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
        if (this.state.loading != LoadingStatus.Loaded) {
            return <Spinner label="Loading dependencies..." size={SpinnerSize.large} className="loading-spinner" />;
        } else {
            return (
                <>
                    <CollapsiblePanel
                        contentKey="depends-on"
                        animate={false}
                        headerLabel="Waiting for others"
                        headerClassName={"list-header"}
                        renderContent={(key: string) => this._renderDependencyGroup(this.state.dependsOn)}
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
                        renderContent={(key: string) => this._renderDependencyGroup(this.state.hasDependency)}
                        isCollapsible={true}
                        initialIsExpanded={true}
                        forceContentUpdate={true}
                        alwaysRenderContents={false}
                    />
                </>
            );
        }
    }

    private _renderDependencyGroup = (dependencies: PortfolioPlanningQueryResultItem[]): JSX.Element => {
        const items: IListBoxItem<IDependencyItemRenderData>[] = [];

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
                            : dependency.TotalEffort
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

    private _renderDependencyItem = (
        index: number,
        item: IListBoxItem<IDependencyItemRenderData>,
        details: IListItemDetails<IListBoxItem<IDependencyItemRenderData>>,
        key?: string
    ): JSX.Element => {
        const imageProps: IImageProps = {
            src: this.state.workItemIcons[item.data.projectId][item.data.workItemType].url,
            className: "item-list-icon",
            imageFit: ImageFit.center,
            maximizeFrame: true
        };

        return (
            <ListItem key={key || item.id} index={index} details={details}>
                <div className="item-list-row">
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
            WorkItemId: this.props.workItem.id
        });

        return dependencies;
    };

    private _getWorkItemIcons = async (workItems: PortfolioPlanningQueryResultItem[]): Promise<WorkItemIconMap> => {
        const workItemIconMap: WorkItemIconMap = {};

        const icon0: IWorkItemIcon = {
            workItemType: "Epic",
            url: "http://localhost/_apis/wit/workItemIcons/icon_crown?color=FF7B00&v=2",
            color: "",
            name: ""
        };

        const icon1: IWorkItemIcon = {
            workItemType: "Epic",
            url: "http://localhost/_apis/wit/workItemIcons/icon_clipboard?color=222222&v=2",
            color: "",
            name: ""
        };

        workItemIconMap["0"] = {};
        workItemIconMap["0"]["Epic"] = icon0;
        workItemIconMap["1"] = {};
        workItemIconMap["1"]["Epic"] = icon1;

        return workItemIconMap;
    };
}
