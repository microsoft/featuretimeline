import { Action } from "redux";
import { IWorkItemOverrideIteration } from "..";

export const OverrideIterationStartType = "@@overrideIteration/start";
export const OverrideIterationEndType = "@@overrideIteration/end";
export const SaveOverrideIterationActionType = "@@overrideIteration/save";
export const OverrideIterationCleanupType = "@@overrideIteration/cleanup";
export const OverrideIterationHoverOverIterationType = "@@overrideIteration/hoveroveriteration";

export interface OverrideIterationStartAction extends Action {
    type: "@@overrideIteration/start",
    payload: IWorkItemOverrideIteration
}

export interface OverrideIterationEndAction extends Action {
    type: "@@overrideIteration/end",
    payload: void
}

export interface SaveOverrideIterationAction extends Action {
    type: "@@overrideIteration/save",
    payload: IWorkItemOverrideIteration
}


export interface OverrideIterationCleanupAction extends Action {
    type: "@@overrideIteration/cleanup",
    payload: void
}

export interface OverrideIterationHoverOverIterationAction extends Action {
    type: "@@overrideIteration/hoveroveriteration",
    payload: string
}

export type OverrideIterationActions = OverrideIterationStartAction | OverrideIterationEndAction | OverrideIterationHoverOverIterationAction | OverrideIterationCleanupAction | SaveOverrideIterationAction;