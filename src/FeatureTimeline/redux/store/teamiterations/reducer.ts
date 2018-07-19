import { Reducer } from 'redux';
import { ITeamSettingsIterationState } from './types';
import { TeamSettingsIterationActions, TeamSettingsIterationReceivedType, TeamSettingsIterationReceivedAction, DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType, ChangeDisplayIterationCountActionType, ShiftDisplayIterationLeftAction, ShiftDisplayIterationRightAction, ChangeDisplayIterationCountAction, RestoreDisplayIterationCountActionType, RestoreDisplayIterationCountAction } from './actions';
import { getCurrentIterationIndex } from '../../helpers/iterationComparer';
import produce from "immer";

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
        case DisplayAllIterationsActionType:
            return handleDisplayAllIterations(state);
        case ShiftDisplayIterationLeftActionType:
            return handleShiftDisplayIterationLeft(state, action);
        case ShiftDisplayIterationRightActionType:
            return handleShiftDisplayIterationRight(state, action);
        case ChangeDisplayIterationCountActionType:
            return handleChangeDisplayIterationCountAction(state, action);
        case RestoreDisplayIterationCountActionType:
            return handleRestoreDisplayIterationCountAction(state, action);
        default:
            return state;
    }
};

function handleRestoreDisplayIterationCountAction(state: ITeamSettingsIterationState, action: RestoreDisplayIterationCountAction) {
    return produce(state, draft => {

        try {
            draft.iterationDisplayOptions = { ...action.payload };
            let { count } = action.payload;
            const iterations = state.teamSettingsIterations[action.payload.projectId][action.payload.teamId] || [];
            draft.iterationDisplayOptions.totalIterations = iterations.length;

            // Handle incase if the team iterations changed before restore


            if (iterations.length === 0 || !count || count > iterations.length || action.payload.endIndex >= iterations.length) {
                console.log("Ignoring restore display options as iterations changed.");
                draft.iterationDisplayOptions = null;
            }
        }
        catch (error) {
            console.log('Can not restore display options: ', error, action);
        }
    });
}

function handleChangeDisplayIterationCountAction(state: ITeamSettingsIterationState, action: ChangeDisplayIterationCountAction) {
    let {
        count,
        teamId,
        projectId
    } = action.payload;

    return produce(state, draft => {

        const originalCount = count;

        const iterations = draft.teamSettingsIterations[projectId][teamId];
        const currentIterationIndex = getCurrentIterationIndex(iterations);

        if (count > iterations.length) {
            count = iterations.length;
        }

        const displayOptions = {
            count,
            originalCount,
            teamId,
            projectId,
            startIndex: 0,
            endIndex: 0,
            totalIterations: iterations.length
        };

        let startIndex = currentIterationIndex - Math.floor((count / 2));
        if (startIndex < 0) {
            startIndex = 0;
        }
        const endIndex = startIndex + (count - 1);

        displayOptions.startIndex = startIndex;
        displayOptions.endIndex = endIndex;

        draft.iterationDisplayOptions = displayOptions;
    });
}


function handleShiftDisplayIterationLeft(state: ITeamSettingsIterationState, action: ShiftDisplayIterationLeftAction) {
    return produce(state, draft => {
        if (draft.iterationDisplayOptions) {
            const displayOptions = draft.iterationDisplayOptions;
            if ((displayOptions.startIndex - action.payload.count) >= 0) {
                displayOptions.startIndex -= action.payload.count;
                displayOptions.endIndex = displayOptions.startIndex + draft.iterationDisplayOptions.count - 1;
            }
            draft.iterationDisplayOptions = displayOptions
        }
    });
}

function handleShiftDisplayIterationRight(state: ITeamSettingsIterationState, action: ShiftDisplayIterationRightAction) {
    return produce(state, draft => {

        if (draft.iterationDisplayOptions) {
            const iterationCount = draft.teamSettingsIterations[draft.iterationDisplayOptions.projectId][draft.iterationDisplayOptions.teamId].length;
            const displayOptions = draft.iterationDisplayOptions;
            if ((displayOptions.endIndex + action.payload.count) < iterationCount) {
                displayOptions.endIndex += action.payload.count;
                displayOptions.startIndex = displayOptions.endIndex - draft.iterationDisplayOptions.count + 1;
            }
            draft.iterationDisplayOptions = displayOptions;
        }
    });
}

function handleDisplayAllIterations(state: ITeamSettingsIterationState) {
    return produce(state, draft => {
        draft.iterationDisplayOptions = null;
    });
}

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