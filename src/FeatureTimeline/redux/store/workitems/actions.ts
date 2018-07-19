import { Action } from "redux";
import { WorkItem, WorkItemLink } from "TFS/WorkItemTracking/Contracts";
import { TrackableAction } from "./types";
import { TeamSettingsIteration, WorkItemTypeStateInfo } from "TFS/Work/Contracts";
export const StartUpdateWorkitemIterationActionType = "@@workitems/StartUpdateWorkitemIterationAction";
export const StartMarkInProgressActionType = "@@workitems/StartMarkInProgressAction";
export const WorkItemSavedActionType = "@@workitems/WorkItemSavedAction";
export const WorkItemSaveFailedActionType = "@@workitems/WorkItemSaveFailedAction";
export const ChangeParentActionType = "@@workitems/ChangeParentAction";
export const WorkItemsReceivedActionType = "@@workitems/WorkItemsReceived";
export const WorkItemLinksReceivedActionType = "@@workitems/WorkItemLinksReceived"
export const LaunchWorkItemFormActionType = "@@workitems/LaunchWorkItemForm";
export const SetOverrideIterationType = "@@workitems/setoverrideiteration";
export const ClearOverrideIterationType = "@@overrideIteration/cleareoverrideiteration";

export interface StartUpdateWorkitemIterationAction extends Action {
    type: "@@workitems/StartUpdateWorkitemIterationAction";
    payload: {
        workItem: number;
        teamIteration: TeamSettingsIteration;
        override: boolean;
    }
}

export interface StartMarkInProgressAction extends Action {
    type: "@@workitems/StartMarkInProgressAction";
    payload: {
        workItem: number;
        teamIteration: TeamSettingsIteration;
        state: string;
    }
}

export interface WorkItemSavedAction extends Action {
    type: "@@workitems/WorkItemSavedAction";
    payload: {
        workItems: number[];
    }
}

export interface WorkItemSaveFailedAction extends Action {
    type: "@@workitems/WorkItemSaveFailedAction";
    payload: {
        workItems: number[];
        error: string;
    }
}

export interface ChangeParentAction extends Action {
    type: "@@workitems/ChangeParentAction";
    payload: {
        workItems: number[];
        newParentId?: number;
    }
}

export interface WorkItemsReceivedAction extends Action {
    type: "@@workitems/WorkItemsReceived";
    payload: {
        workItems: WorkItem[];
        parentWorkItemIds: number[];
        currentLevelWorkItemIds: number[];
        childLevelWorkItemIds: number[];
        workItemTypeStateInfo: WorkItemTypeStateInfo[]
    }
}

export interface WorkItemLinksReceivedAction extends Action {
    type: "@@workitems/WorkItemLinksReceived";
    payload: {
        workItemLinks: WorkItemLink[];
    }
}

export interface LaunchWorkItemFormAction extends TrackableAction {
    type: "@@workitems/LaunchWorkItemForm";
    payload: {
        workItemId: number;
    }
}


export interface SetOverrideIterationAction extends TrackableAction {
    type: "@@workitems/setoverrideiteration";
    payload: {
        workItemId: number;
        startIterationId: string;
        endIterationId: string;
        user: string;
    }
}

export interface ClearOverrideIterationAction extends Action {
    type: "@@overrideIteration/cleareoverrideiteration",
    payload: number
}


export type WorkItemActions = StartMarkInProgressAction | StartUpdateWorkitemIterationAction | ChangeParentAction | WorkItemsReceivedAction | WorkItemLinksReceivedAction | LaunchWorkItemFormAction;
export type OverrideIterationActions = SetOverrideIterationAction | ClearOverrideIterationAction;