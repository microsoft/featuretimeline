import { ActionCreator } from 'redux';
import { OverrideIterationStartAction, OverrideIterationStartType, OverrideIterationEndAction, OverrideIterationEndType, OverrideIterationHoverOverIterationAction, OverrideIterationHoverOverIterationType, OverrideIterationCleanupAction, OverrideIterationCleanupType, SaveOverrideIterationAction, SaveOverrideIterationActionType } from './actions';
import { IWorkItemOverrideIteration } from '../modules/OverrideIterations/overriddenIterationContracts';

export const startOverrideIteration: ActionCreator<OverrideIterationStartAction> =
    (payload: IWorkItemOverrideIteration) => ({
        type: OverrideIterationStartType,
        payload
    });


export const endOverrideIteration: ActionCreator<OverrideIterationEndAction> =
    (payload: void) => ({
        type: OverrideIterationEndType,
        payload
    });


export const cleanupOverrideIteration: ActionCreator<OverrideIterationCleanupAction> =
    (payload: void) => ({
        type: OverrideIterationCleanupType,
        payload
    });



export const overrideHoverOverIteration: ActionCreator<OverrideIterationHoverOverIterationAction> =
    (payload: string) => ({
        type: OverrideIterationHoverOverIterationType,
        payload
    });


export const saveOverrideIteration: ActionCreator<SaveOverrideIterationAction> =
    (payload: IWorkItemOverrideIteration) => ({
        type: SaveOverrideIterationActionType,
        payload
    });
