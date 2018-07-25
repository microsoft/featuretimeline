import { IIterationDisplayOptions } from "../../Contracts/GridViewContracts";
import { Action } from "redux";
import { ActionCreator } from "react-redux";

export interface DisplayAllIterationsAction extends Action {
    type: "@@TeamSettingsIteration/DisplayAllIterationsAction";
    payload: void;
}

export interface ChangeDisplayIterationCountAction extends Action {
    type: "@@TeamSettingsIteration/ChangeDisplayIterationCountAction";
    payload: {
        count: number,
        teamId: string,
        projectId: string,
        currentIterationIndex: number,
        maxIterations: number
    }
}

export interface RestoreDisplayIterationCountAction extends Action {
    type: "@@TeamSettingsIteration/RestoreDisplayIterationCountAction";
    payload: {
        displayOptions: IIterationDisplayOptions
    }
}

export interface ShiftDisplayIterationLeftAction extends Action {
    type: "@@TeamSettingsIteration/ShiftDisplayIterationLeftAction";
    payload: {
        count: number,
        maxIterations: number
    }
}

export interface ShiftDisplayIterationRightAction extends Action {
    type: "@@TeamSettingsIteration/ShiftDisplayIterationRightAction";
    payload: {
        count: number,
        maxIterations: number
    }
}


export const ChangeDisplayIterationCountActionType = "@@TeamSettingsIteration/ChangeDisplayIterationCountAction";
export const RestoreDisplayIterationCountActionType = "@@TeamSettingsIteration/RestoreDisplayIterationCountAction";
export const ShiftDisplayIterationLeftActionType = "@@TeamSettingsIteration/ShiftDisplayIterationLeftAction";
export const ShiftDisplayIterationRightActionType = "@@TeamSettingsIteration/ShiftDisplayIterationRightAction";
export const DisplayAllIterationsActionType = "@@TeamSettingsIteration/DisplayAllIterationsAction";
export const displayAllIterations: ActionCreator<DisplayAllIterationsAction> =
    () => ({
        type: DisplayAllIterationsActionType,
        payload: null
    });

export const changeDisplayIterationCount: ActionCreator<ChangeDisplayIterationCountAction> =
    (count: number, projectId: string, teamId: string, maxIterations: number, currentIterationIndex: number) => ({
        type: ChangeDisplayIterationCountActionType,
        payload: {
            count,
            projectId,
            teamId,
            maxIterations,
            currentIterationIndex
        }
    });

export const restoreDisplayIterationCount: ActionCreator<RestoreDisplayIterationCountAction> =
    (displayOptions: IIterationDisplayOptions, maxIterations: number) => ({
        type: RestoreDisplayIterationCountActionType, 
        payload: {
            displayOptions,
            maxIterations
        }
    });

export const shiftDisplayIterationLeft: ActionCreator<ShiftDisplayIterationLeftAction> =
    (count: number, maxIterations: number) => ({
        type: ShiftDisplayIterationLeftActionType,
        payload: {
            count,
            maxIterations
        }
    });

export const shiftDisplayIterationRight: ActionCreator<ShiftDisplayIterationRightAction> =
    (count: number, maxIterations: number) => ({
        type: ShiftDisplayIterationRightActionType,
        payload: {
            count,
            maxIterations
        }
    });

export type IterationDisplayActions = DisplayAllIterationsAction | ChangeDisplayIterationCountAction | RestoreDisplayIterationCountAction | ShiftDisplayIterationLeftAction | ShiftDisplayIterationRightAction;