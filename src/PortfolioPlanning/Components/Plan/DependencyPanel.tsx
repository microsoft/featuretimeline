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
                    dependsOn: dependencies.DependsOn,
                    hasDependency: dependencies.HasDependency,
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
            return (
                <Spinner
                    label="Loading dependencies..."
                    size={SpinnerSize.large}
                    className="dependency-loading-spinner"
                />
            );
        } else {
            return (
                <>
                    <div>{this.state.dependsOn.map(d => <div>{d.Title}</div>)}</div>
                    <div>{this.state.hasDependency.map(d => <div>{d.Title}</div>)}</div>
                </>
            );
        }
    }

    private _getDependencies = async (): Promise<PortfolioPlanningDependencyQueryResult> => {
        const dependencies = await PortfolioPlanningDataService.getInstance().runDependencyQuery({
            WorkItemId: this.props.workItem.id
        });

        return dependencies;
    };
}
