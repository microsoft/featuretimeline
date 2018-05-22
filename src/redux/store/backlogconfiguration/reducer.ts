import { Reducer } from 'redux';
import { IBacklogConfigurationState } from './types';
import { BacklogConfigurationActions, BacklogConfigurationReceivedType, BacklogConfigurationReceivedAction } from './actions';

// Type-safe initialState!
const getInitialState = () => {
    return {
        backlogConfigurations: {}
    }
};

const reducer: Reducer<IBacklogConfigurationState> = (state: IBacklogConfigurationState = getInitialState(), action: BacklogConfigurationActions) => {
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

    const backlogConfigurations = {...newState.backlogConfigurations};
    const projectData = backlogConfigurations[projectId] ? { ...backlogConfigurations[projectId] } : {};
    projectData[teamId] = backlogConfiguration;
    backlogConfigurations[projectId] = { ...projectData };
    newState.backlogConfigurations = backlogConfigurations;
    return newState;
}

export default reducer;