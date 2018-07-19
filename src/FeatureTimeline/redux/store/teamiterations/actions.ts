import { Action } from "redux";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { IIterationDisplayOptions } from "./types";

export const TeamSettingsIterationReceivedType = "@@TeamSettingsIteration/TeamSettingsIterationReceived";
export const ChangeDisplayIterationCountActionType = "@@TeamSettingsIteration/ChangeDisplayIterationCountAction";
export const RestoreDisplayIterationCountActionType = "@@TeamSettingsIteration/RestoreDisplayIterationCountAction";
export const ShiftDisplayIterationLeftActionType = "@@TeamSettingsIteration/ShiftDisplayIterationLeftAction";
export const ShiftDisplayIterationRightActionType = "@@TeamSettingsIteration/ShiftDisplayIterationRightAction";
export const DisplayAllIterationsActionType = "@@TeamSettingsIteration/DisplayAllIterationsAction";

export interface TeamSettingsIterationReceivedAction extends Action {
    type: "@@TeamSettingsIteration/TeamSettingsIterationReceived";
    payload: {
        projectId: string;
        teamId: string;
        TeamSettingsIterations: TeamSettingsIteration[];
    }
}

export interface DisplayAllIterationsAction extends Action {
    type: "@@TeamSettingsIteration/DisplayAllIterationsAction";
    payload: void;
}

export interface ChangeDisplayIterationCountAction extends Action {
    type: "@@TeamSettingsIteration/ChangeDisplayIterationCountAction";
    payload: {
        count: number,
        teamId: string,
        projectId: string
    }
}

export interface RestoreDisplayIterationCountAction extends Action {
    type: "@@TeamSettingsIteration/RestoreDisplayIterationCountAction";
    payload: IIterationDisplayOptions
}

export interface ShiftDisplayIterationLeftAction extends Action {
    type: "@@TeamSettingsIteration/ShiftDisplayIterationLeftAction";
    payload: {
        count: number
    }
}

export interface ShiftDisplayIterationRightAction extends Action {
    type: "@@TeamSettingsIteration/ShiftDisplayIterationRightAction";
    payload: {
        count: number
    }
}

export type TeamSettingsIterationActions = TeamSettingsIterationReceivedAction | DisplayAllIterationsAction | ChangeDisplayIterationCountAction | ShiftDisplayIterationLeftAction | ShiftDisplayIterationRightAction | RestoreDisplayIterationCountAction;