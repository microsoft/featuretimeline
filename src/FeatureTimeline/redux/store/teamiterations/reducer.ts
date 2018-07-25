import { Reducer } from 'redux';
import { ITeamSettingsIterationState } from './types';
import produce from "immer";
import { TeamSettingsIterationActions, TeamSettingsIterationReceivedType, TeamSettingsIterationReceivedAction } from './actions';
import { iterationDisplayOptionsReducer } from '../../../../Common/redux/modules/IterationDisplayOptions/iterationDisplayOptionsReducer';

// Type-safe initialState!
export const getInitialState = (): ITeamSettingsIterationState => {
    return {
        // project -> team -> teamsettingsiterations
        teamSettingsIterations: {},
        iterationDisplayOptions: null
    };
};
const reducer: Reducer<ITeamSettingsIterationState> = (state: ITeamSettingsIterationState = getInitialState(),
    action: TeamSettingsIterationActions) => {
    switch (action.type) {
        case TeamSettingsIterationReceivedType:
            return handleTeamSettingsIterationReceived(state, action as TeamSettingsIterationReceivedAction);
        default:
            return produce(state, draft => {
                draft.iterationDisplayOptions = iterationDisplayOptionsReducer(draft.iterationDisplayOptions, action);
            });

    }
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