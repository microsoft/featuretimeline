import { Reducer } from 'redux';
import { ITeamSettingState } from './types';
import { TeamSettingActions, TeamSettingReceivedType, TeamSettingReceivedAction } from './actions';
import produce from "immer";

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
    return produce(state, draft => {
        const {
            projectId,
            teamId,
            teamSetting
        } = action.payload;

        const projectData = draft.teamSetting[projectId] || {};
        projectData[teamId] = teamSetting;
        draft.teamSetting[projectId] = projectData;

    });
}

export default reducer;