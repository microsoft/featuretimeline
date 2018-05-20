import { Reducer } from 'redux';
import { ITeamSettingState } from './types';
import { TeamSettingActions, TeamSettingReceivedType, TeamSettingReceivedAction } from './actions';

// Type-safe initialState!
const getInitialState = () => {
    return {
        teamSetting: {}
    }
};

const reducer: Reducer<ITeamSettingState> = (state: ITeamSettingState = getInitialState(), action: TeamSettingActions) => {
    switch (action.type) {
        case TeamSettingReceivedType:
            return handleTeamSettingReceived(state, action as TeamSettingReceivedAction);
        default:
            return state;
    }
};

function handleTeamSettingReceived(state: ITeamSettingState, action: TeamSettingReceivedAction): ITeamSettingState {
    let newState = { ...state };
    const {
        projectId,
        teamId,
        teamSetting
    } = action.payload;

    const projectData = newState.teamSetting[projectId] ? { ...newState.teamSetting[projectId] } : {};
    projectData[teamId] = teamSetting;
    newState.teamSetting[projectId] = projectData;

    return newState;
}

export default reducer;