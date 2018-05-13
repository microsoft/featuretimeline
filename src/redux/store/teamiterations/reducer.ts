import { Reducer } from 'redux';
import { ITeamSettingsIterationState } from './types';
import { TeamSettingsIterationActions, TeamSettingsIterationReceivedType, TeamSettingsIterationReceivedAction, DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType, ChangeDisplayIterationCountActionType, ShiftDisplayIterationLeftAction, ShiftDisplayIterationRightAction, ChangeDisplayIterationCountAction, RestoreDisplayIterationCountActionType, RestoreDisplayIterationCountAction } from './actions';
import { getCurrentIterationIndex } from '../../helpers/iterationComparer';

// Type-safe initialState!
export const initialState: ITeamSettingsIterationState = {
    // project -> team -> teamsettingsiterations
    teamSettingsIterations: {},
    iterationDisplayOptions: null
};

const reducer: Reducer<ITeamSettingsIterationState> = (state: ITeamSettingsIterationState = initialState,
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
    let newState = { ...state };

    try {
        newState.iterationDisplayOptions = { ...action.payload };
        let { count } = action.payload;
        const iterations = state.teamSettingsIterations[action.payload.projectId][action.payload.teamId] || [];
        newState.iterationDisplayOptions.totalIterations = iterations.length;

        // Handle incase if the team iterations changed before restore


        if (iterations.length === 0 || !count || count > iterations.length || action.payload.endIndex >= iterations.length) {
            console.log("Ignoring restore display options as iterations changed.");
            newState.iterationDisplayOptions = null;
        }
    }
    catch (error) {
        newState = state;
        console.log('Can not restore display options: ', error, action);
    }
    return newState;
}

function handleChangeDisplayIterationCountAction(state: ITeamSettingsIterationState, action: ChangeDisplayIterationCountAction) {
    let {
        count,
        teamId,
        projectId
    } = action.payload;

    const originalCount = count;

    const iterations = state.teamSettingsIterations[projectId][teamId];
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

    const newState = { ...state };
    newState.iterationDisplayOptions = displayOptions;
    return newState;
}


function handleShiftDisplayIterationLeft(state: ITeamSettingsIterationState, action: ShiftDisplayIterationLeftAction) {
    if (state.iterationDisplayOptions) {
        const newState = { ...state };

        const displayOptions = { ...newState.iterationDisplayOptions };
        if ((displayOptions.startIndex - action.payload.count) >= 0) {
            displayOptions.startIndex -= action.payload.count;
            displayOptions.endIndex = displayOptions.startIndex + state.iterationDisplayOptions.count - 1;
        }
        newState.iterationDisplayOptions = displayOptions
        return newState;
    }
    return state;
}

function handleShiftDisplayIterationRight(state: ITeamSettingsIterationState, action: ShiftDisplayIterationRightAction) {
    if (state.iterationDisplayOptions) {
        const newState = { ...state };
        const iterationCount = state.teamSettingsIterations[state.iterationDisplayOptions.projectId][state.iterationDisplayOptions.teamId].length;
        const displayOptions = { ...newState.iterationDisplayOptions };
        if ((displayOptions.endIndex + action.payload.count) < iterationCount) {
            displayOptions.endIndex += action.payload.count;
            displayOptions.startIndex = displayOptions.endIndex - state.iterationDisplayOptions.count + 1;
        }
        newState.iterationDisplayOptions = displayOptions;
        return newState;
    }
    return state;
}

function handleDisplayAllIterations(state: ITeamSettingsIterationState) {
    const newState = { ...state };
    newState.iterationDisplayOptions = null;
    return newState;
}

function handleTeamSettingsIterationReceived(state: ITeamSettingsIterationState, action: TeamSettingsIterationReceivedAction): ITeamSettingsIterationState {
    let newState = { ...state };
    const {
        projectId,
        teamId,
        TeamSettingsIterations
    } = action.payload;

    const projectData = newState.teamSettingsIterations[projectId] ? { ...newState.teamSettingsIterations[projectId] } : {};
    projectData[teamId] = TeamSettingsIterations;
    newState.teamSettingsIterations[projectId] = projectData;

    return newState;
}

export default reducer;