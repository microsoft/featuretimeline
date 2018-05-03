import { Reducer } from 'redux';
import { IBacklogConfigurationState } from './types';
import { BacklogConfigurationActions, BacklogConfigurationReceivedType, BacklogConfigurationReceivedAction } from './actions';

// Type-safe initialState!
export const initialState: IBacklogConfigurationState = {
    backlogConfigurations: {}
};

const reducer: Reducer<IBacklogConfigurationState> = (state: IBacklogConfigurationState = initialState, action: BacklogConfigurationActions) => {
    switch (action.type) {
        case BacklogConfigurationReceivedType:
            return handleBacklogConfigurationReceived(state, action as BacklogConfigurationReceivedAction);
        default:
            return state;
    }
};

function handleBacklogConfigurationReceived(state: IBacklogConfigurationState, action: BacklogConfigurationReceivedAction): IBacklogConfigurationState {
    let newState = { ...state };
    const {
        projectId,
        teamId,
        backlogConfiguration
    } = action.payload;

    const projectData = newState.backlogConfigurations[projectId] ? { ...newState.backlogConfigurations[projectId] } : {};
    projectData[teamId] = backlogConfiguration;
    newState.backlogConfigurations[projectId] = projectData;

    return newState;
}

export default reducer;