import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { UIStatus } from '../../../Common/Contracts/types';
import { getProjectId, getTeamId } from '../../../Common/Selectors/CommonSelectors';
import { IEpicRollupState } from '../../redux/contracts';
import configureEpicRollupStore from '../../redux/epicRollupStore';
import { IEpicRollupGridView, epicRollupGridViewSelector } from '../../redux/selectors/epicRollupGridViewSelector';

initializeIcons(/* optional base url */);

export interface IEpicRollupGridProps {
    projectId: string;
    teamId: string;
    uiState: UIStatus;
    gridView: IEpicRollupGridView,
    //childItems: number[];
    //settingsState: ISettingsState;
}


class Grid extends React.Component<IEpicRollupGridProps, {}> {
    constructor() {
        super();
    }

    public render(): JSX.Element {
        const {
            uiState,
        } = this.props;

        if (uiState === UIStatus.Loading) {
            return (
                <Spinner size={SpinnerSize.large} label="Loading..." />
            );
        }

        if (uiState === UIStatus.NoTeamIterations) {
            return (
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={false}
                >
                    {"The team does not have any iteration selected, please visit team admin page and select team iterations."}
                </MessageBar>
            );
        }

        if (uiState === UIStatus.NoWorkItems) {
            return (<MessageBar
                messageBarType={MessageBarType.info}
                isMultiline={false}
            >
                {"No in-progress Features for the timeline."}
            </MessageBar>);
        }
        return (<div>{"Epic Rollup is great"}</div>)
    }
}


const makeMapStateToProps = () => {
    return (state: IEpicRollupState) => {
        return {
            projectId: getProjectId(),
            teamId: getTeamId(),
            uiState: UIStatus.Default,
            gridView: epicRollupGridViewSelector(state)
        }
    }
}

export const ConnectedEpicRollupGrid = connect(makeMapStateToProps)(Grid);

export const EpicRollupGrid = () => {
    const initialState: IEpicRollupState = {
        backlogConfigurations: {},
        teamIterations: {},
        savedOverriddenIterations: {},
        workItemsState: {},
        workItemMetadata: {},
        teamSettings: {},
        iterationDisplayOptions: {},
        settingsState: {},
        progress: {}
    } as IEpicRollupState;
    const store = configureEpicRollupStore(initialState);

    // const projectId = getProjectId();
    // const teamId = getTeamId();

    return (
        <Provider store={store}>
            <ConnectedEpicRollupGrid />
        </Provider>);
}


