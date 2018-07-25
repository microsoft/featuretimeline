import { Reducer } from 'redux';
import produce from "immer";
import {
    IterationDisplayActions, DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType,
    ChangeDisplayIterationCountActionType, RestoreDisplayIterationCountActionType, ShiftDisplayIterationRightAction, ShiftDisplayIterationLeftAction,
    ChangeDisplayIterationCountAction, RestoreDisplayIterationCountAction
} from './IterationDisplayOptionsActions';
import { IIterationDisplayOptions } from '../../Contracts/GridViewContracts';

// Type-safe initialState!
export const getInitialState = (): IIterationDisplayOptions => {
    return null;
};
export const iterationDisplayOptionsReducer: Reducer<IIterationDisplayOptions> =
    (state: IIterationDisplayOptions = getInitialState(),
        action: IterationDisplayActions) => {
        switch (action.type) {
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

function handleRestoreDisplayIterationCountAction(state: IIterationDisplayOptions, action: RestoreDisplayIterationCountAction) {
    const {
        displayOptions
    } = action.payload;

    try {
        let newDisplayOptions = { ...displayOptions };
        let { count } = displayOptions;
        const maxIterations = displayOptions.totalIterations;
        newDisplayOptions.totalIterations = maxIterations;

        // Handle incase if the team iterations changed before restore
        if (maxIterations === 0 || !count || count > maxIterations || displayOptions.endIndex >= maxIterations) {
            console.log("Ignoring restore display options as iterations changed.");
            newDisplayOptions = null;
        }

        return newDisplayOptions;
    }
    catch (error) {
        console.log('Can not restore display options: ', error, action);
    }
    return null;
}

function handleChangeDisplayIterationCountAction(state: IIterationDisplayOptions, action: ChangeDisplayIterationCountAction) {
    let {
        count,
        teamId,
        projectId,
        maxIterations,
        currentIterationIndex
    } = action.payload;

    const originalCount = count;

    if (count > maxIterations) {
        count = maxIterations;
    }

    const displayOptions = {
        count,
        originalCount,
        teamId,
        projectId,
        startIndex: 0,
        endIndex: 0,
        totalIterations: maxIterations
    };

    let startIndex = currentIterationIndex - Math.floor((count / 2));
    if (startIndex < 0) {
        startIndex = 0;
    }
    const endIndex = startIndex + (count - 1);

    displayOptions.startIndex = startIndex;
    displayOptions.endIndex = endIndex;

    return displayOptions;
}


function handleShiftDisplayIterationLeft(state: IIterationDisplayOptions, action: ShiftDisplayIterationLeftAction) {
    return produce(state, draft => {
        if (draft) {
            const displayOptions = draft;
            if ((displayOptions.startIndex - action.payload.count) >= 0) {
                displayOptions.startIndex -= action.payload.count;
                displayOptions.endIndex = displayOptions.startIndex + draft.count - 1;
            }
            draft = displayOptions;
        }
    });
}

function handleShiftDisplayIterationRight(state: IIterationDisplayOptions, action: ShiftDisplayIterationRightAction) {
    return produce(state, draft => {

        if (draft) {
            const iterationCount = action.payload.maxIterations;
            const displayOptions = draft;
            if ((displayOptions.endIndex + action.payload.count) < iterationCount) {
                displayOptions.endIndex += action.payload.count;
                displayOptions.startIndex = displayOptions.endIndex - draft.count + 1;
            }
            draft = displayOptions;
        }
    });
}

function handleDisplayAllIterations(state: IIterationDisplayOptions) {
    return null;
}

