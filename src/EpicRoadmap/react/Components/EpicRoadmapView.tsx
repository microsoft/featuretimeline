import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { UIStatus } from '../../../Common/redux/Contracts/types';
import { getProjectId, getTeamId } from '../../../Common/redux/Selectors/CommonSelectors';
import { IEpicRoadmapState } from '../../redux/contracts';
import configureEpicRoadmapStore from '../../redux/EpicRoadmapStore';
import { uiStateSelector, outOfScopeWorkItems } from '../../redux/selectors/uiStateSelector';
import { EpicRoadmapGrid } from './EpicRoadmapGrid';
import { EpicSelector } from './EpicSelector';
import './EpicRoadmapView.scss';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { launchWorkItemForm } from '../../../Common/redux/actions/launchWorkItemForm';
import { SimpleWorkItem } from '../../../Common/react/Components/WorkItem/SimpleWorkItem';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { PromotePortfolioPlansBanner } from '../../../Common/react/Components/PromotePortfolioPlans';
import { dismissPortfolioPlansBanner } from '../../../Common/redux/modules/SettingsState/SettingsStateActions';
import { Link } from "azure-devops-ui/Link";

initializeIcons(/* optional base url */);

export interface IEpicRoadmapViewProps {
    projectId: string;
    teamId: string;
    uiState: UIStatus;
    outOfScopeWorkItems: WorkItem[];
    launchWorkItemForm: (id: number) => void;
    portfolioPlansBannerDismissed: boolean;
    dismissPortfolioPlansBanner: () => void;
}

export interface IEpicRoadmapViewContentState {
    showCallout: boolean
}
class EpicRoadmapViewContent extends React.Component<IEpicRoadmapViewProps, IEpicRoadmapViewContentState> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            showCallout: false
        }
    }

    private _calloutContainer: HTMLDivElement;
    public render(): JSX.Element {
        const {
            uiState,
        } = this.props;

        let showSelector: boolean = true;

        if (uiState === UIStatus.Loading) {
            return (
                <Spinner size={SpinnerSize.large} className="loading-indicator" label="Loading..." />
            );
        } else if (uiState === UIStatus.Error) {
            return (
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={false}
                >{"Epic Roadmap requires atleast two levels of Portfolio backlogs."}
                </MessageBar>
            );
        }

        let contents = null;
        if (uiState === UIStatus.NoTeamIterations) {
            contents = (
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={false}
                >
                    {"The team does not have any iteration selected, please visit team admin page and select team iterations."}
                </MessageBar>
            );
        }

        if (uiState === UIStatus.NoWorkItems) {
            contents = (
                <MessageBar
                    messageBarType={MessageBarType.info}
                    isMultiline={false}
                >
                    {"Select an Epic."}
                </MessageBar>
            );
        }

        if (uiState === UIStatus.NoEpics) {
            showSelector = false;
            contents = (
                <MessageBar
                    messageBarType={MessageBarType.warning}
                    isMultiline={false}
                >
                    {"Team does not have any Epics assigned."}
                </MessageBar>
            );
        }

        let additionalMessage = null;
        if (uiState === UIStatus.OutofScopeTeamIterations) {
            const style = { cursor: "pointer" };
            additionalMessage = (
                <MessageBar
                    messageBarType={MessageBarType.severeWarning}
                    isMultiline={true}
                    onClick={this._toggleCallout}
                >
                    <div style={style} ref={ref => this._calloutContainer = ref} onClick={this._toggleCallout}>{"Some Work Items are excluded as they are in iterations that the current team does not subscribe to. Click here to see the details"}</div>
                </MessageBar>
            );
        }

        if (uiState === UIStatus.Default || uiState === UIStatus.OutofScopeTeamIterations) {
            contents = <EpicRoadmapGrid />;
        }

        let callout = null;
        if (this.state.showCallout) {
            callout = this._renderCallout();
        }

        return (
            <>
                {!this.props.portfolioPlansBannerDismissed &&
                    <PromotePortfolioPlansBanner onDismiss={this.props.dismissPortfolioPlansBanner} />}
                <div className="epic-container">
                    {showSelector && <EpicSelector />}
                    {additionalMessage}
                    {callout}
                    {contents}
                </div>
            </>
        );
    }

    private _toggleCallout = () => {
        this.setState({
            showCallout: !this.state.showCallout
        })
    }

    private _renderCallout = () => {
        if (!this._calloutContainer) {
            return;
        }
        const {
            outOfScopeWorkItems
        } = this.props;

        const uniqueIterations = new Set();
        outOfScopeWorkItems.forEach(w => uniqueIterations.add(w.fields["System.IterationPath"]));

        const iterations = Array.from(uniqueIterations).sort();
        return (
            <Callout
                className="work-item-links-list-callout"
                target={this._calloutContainer}
                onDismiss={this._toggleCallout}
                isBeakVisible={true}
            >
                <div>{"Please add following iterations in team settings to include these workitems."}</div>
                {
                    iterations.map(i => <div className="missing-iteration-name">{i}</div>)
                }
                <div className="simple-work-item-list">
                    {
                        outOfScopeWorkItems.map(w =>
                            <SimpleWorkItem
                                workItem={w}
                                onShowWorkItem={this.props.launchWorkItemForm}
                            />
                        )
                    }
                </div>
            </Callout>
        );
    }
}


const makeMapStateToProps = () => {
    return (state: IEpicRoadmapState) => {
        return {
            projectId: getProjectId(),
            teamId: getTeamId(),
            uiState: uiStateSelector(state),
            outOfScopeWorkItems: outOfScopeWorkItems(state),
            portfolioPlansBannerDismissed: state.settingsState.dismissedPortfolioPlansBanner
        }
    }
}

const mapDispatchToProps = () => {
    return (dispatch) => {
        return {
            launchWorkItemForm: (id) => {
                if (id) {
                    dispatch(launchWorkItemForm(id));
                }
            },
            dismissPortfolioPlansBanner: () => {
                dispatch(dismissPortfolioPlansBanner())
            }
        }
    }
}
export const ConnectedEpicRoadmapViewContent = connect(makeMapStateToProps, mapDispatchToProps)(EpicRoadmapViewContent);

export const EpicRoadmapView = () => {
    const initialState: IEpicRoadmapState = {
    } as IEpicRoadmapState;
    const store = configureEpicRoadmapStore(initialState);

    return (
        <Provider store={store}>
            <ConnectedEpicRoadmapViewContent />
        </Provider>);
}


