import { Reducer } from 'redux';
import { ITeamSettingsIterationState } from './types';
import produce from "immer";
import { TeamSettingsIterationActions, TeamSettingsIterationReceivedType, TeamSettingsIterationReceivedAction } from './actions';

// Type-safe initialState!
export const getInitialState = (): ITeamSettingsIterationState => {
    return {
        // project -> team -> teamsettingsiterations
        teamSettingsIterations: {}
    };
};
const reducer: Reducer<ITeamSettingsIterationState> = (state: ITeamSettingsIterationState,
    action: TeamSettingsIterationActions) => {

    if (!state) {
        state = getInitialState();
    }
    switch (action.type) {
        case TeamSettingsIterationReceivedType:
            return handleTeamSettingsIterationReceived(state, action as TeamSettingsIterationReceivedAction);
    }

    return state;
};

function handleTeamSettingsIterationReceived(state: ITeamSettingsIterationState, action: TeamSettingsIterationReceivedAction): ITeamSettingsIterationState {
    return produce(state, draft => {
        const {
            projectId,
            teamId,
            TeamSettingsIterations
        } = action.payload;

        const projectData = draft.teamSettingsIterations[projectId] || {};
        projectData[teamId] = TeamSettingsIterations;
        draft.teamSettingsIterations[projectId] = projectData;

    });
}

export default reducer;