import { StartUpdateWorkitemIterationAction } from "../../../../Common/redux/actions/StartUpdateWorkitemIterationAction";

import { Action } from "redux";
import { WorkItem, WorkItemLink } from "azure-devops-extension-api/WorkItemTracking";
import { TeamSettingsIteration, WorkItemTypeStateInfo } from "azure-devops-extension-api/Work";
export const StartMarkInProgressActionType = "@@workitems/StartMarkInProgressAction";
export const ChangeParentActionType = "@@workitems/ChangeParentAction";
export const WorkItemsReceivedActionType = "@@workitems/WorkItemsReceived";
export const WorkItemLinksReceivedActionType = "@@workitems/WorkItemLinksReceived"

export interface StartMarkInProgressAction extends Action {
    type: "@@workitems/StartMarkInProgressAction";
    payload: {
        workItem: number;
        teamIteration: TeamSettingsIteration;
        state: string;
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


export type WorkItemActions = StartMarkInProgressAction | StartUpdateWorkitemIterationAction | ChangeParentAction | WorkItemsReceivedAction | WorkItemLinksReceivedAction;
