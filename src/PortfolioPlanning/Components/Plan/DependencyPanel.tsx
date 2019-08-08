import * as React from "react";
import { Panel } from "azure-devops-ui/Panel";
import "./DependencyPanel.scss";
import { ITimelineItem, LoadingStatus } from "../../Contracts";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
import {
    PortfolioPlanningDependencyQueryResult,
    PortfolioPlanningQueryResultItem
} from "../../Models/PortfolioPlanningQueryModels";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { CollapsiblePanel } from "../../Common/Components/CollapsiblePanel";

export interface IDependencyPanelProps {
    workItem: ITimelineItem;
    onDismiss: () => void;
}

export interface IDependencyPanelState {
    dependsOn: PortfolioPlanningQueryResultItem[];
    hasDependency: PortfolioPlanningQueryResultItem[];
    loading: LoadingStatus;
    errorMessage: string;
}

export class DependencyPanel extends React.Component<IDependencyPanelProps, IDependencyPanelState> {
    constructor(props) {
        super(props);

        this.state = { loading: LoadingStatus.NotLoaded, dependsOn: [], hasDependency: [], errorMessage: "" };

        this._getDependencies().then(
            dependencies => {
                this.setState({
                    dependsOn: dependencies.DependsOn.reduce((res, current, index, array) => {
                        return res.concat([
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current
                        ]);
                    }, []),
                    hasDependency: dependencies.HasDependency.reduce((res, current, index, array) => {
                        return res.concat([
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current,
                            current
                        ]);
                    }, []),
                    loading: LoadingStatus.Loaded
                });
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
                        renderContent={(key: string) => {
                            return <div>{this.state.dependsOn.map(this._renderDependencyItem)}</div>;
                        }}
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
                        renderContent={(key: string) => {
                            return <div>{this.state.hasDependency.map(this._renderDependencyItem)}</div>;
                        }}
                        isCollapsible={true}
                        initialIsExpanded={true}
                        forceContentUpdate={true}
                        alwaysRenderContents={false}
                    />
                </>
            );
        }
    }

    private _renderDependencyItem(item: PortfolioPlanningQueryResultItem): JSX.Element {
        return <div>{item.Title}</div>;
    }

    private _getDependencies = async (): Promise<PortfolioPlanningDependencyQueryResult> => {
        const dependencies = await PortfolioPlanningDataService.getInstance().runDependencyQuery({
            WorkItemId: this.props.workItem.id
        });

        return dependencies;
    };
}
