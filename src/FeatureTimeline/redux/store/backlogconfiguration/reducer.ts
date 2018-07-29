import { Reducer } from 'redux';
import { IBacklogConfigurationState } from './types';
import { BacklogConfigurationActions, BacklogConfigurationReceivedType, BacklogConfigurationReceivedAction } from './actions';
import produce from "immer";

// Type-safe initialState!
const getInitialState = () => {
    return {
        backlogConfigurations: {}
    }
};

const reducer: Reducer<IBacklogConfigurationState> = (state: IBacklogConfigurationState = getInitialState(), action: BacklogConfigurationActions) => {
    return produce(state, draft => {
        switch (action.type) {
            case BacklogConfigurationReceivedType:
                return handleBacklogConfigurationReceived(draft, action as BacklogConfigurationReceivedAction);
        }
    });
};

function handleBacklogConfigurationReceived(state: IBacklogConfigurationState, action: BacklogConfigurationReceivedAction): IBacklogConfigurationState {
    const {
        projectId,
        teamId,
        backlogConfiguration
    } = action.payload;

    backlogConfiguration.portfolioBacklogs.sort((b1, b2) => b1.rank - b2.rank);
    const projectData = state.backlogConfigurations[projectId] || {};
    projectData[teamId] = backlogConfiguration;
    state.backlogConfigurations[projectId] = projectData;

    return state;
}

export default reducer;