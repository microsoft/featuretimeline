import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import * as React from 'react';
import { UIStatus } from '../../../Common/Contracts/types';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { IEpicRollupState } from '../../redux/contracts';
import { getProjectId, getTeamId } from '../../../Common/CommonSelectors';
import { connect, Provider } from 'react-redux';
import configureEpicRollupStore from '../../redux/epicRollupStore';

initializeIcons(/* optional base url */);

export interface IEpicRollupGridProps {
    projectId: string;
    teamId: string;
    uiState: UIStatus;
    //gridView: IGridView,
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
        }
    }
}

export const ConnectedEpicRollupGrid = connect(makeMapStateToProps)(Grid);

export const EpicRollupGrid = () => {
    const initialState: IEpicRollupState = {        
    } as IEpicRollupState;
    const store = configureEpicRollupStore(initialState);

    // const projectId = getProjectId();
    // const teamId = getTeamId();

    return (
        <Provider store={store}>
            <ConnectedEpicRollupGrid />
        </Provider>);
}


