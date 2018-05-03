import { ActionCreator } from 'redux';
import {
    StartUpdateWorkitemIterationAction, WorkItemLinksReceivedActionType,
    StartUpdateWorkitemIterationActionType, ChangeParentAction,
    ChangeParentActionType, WorkItemsReceivedAction,
    WorkItemsReceivedActionType, WorkItemLinksReceivedAction,
    ReplaceWorkItemsAction, ReplaceWorkItemsActionType, LaunchWorkItemFormAction,
    LaunchWorkItemFormActionType, SetOverrideIterationAction, SetOverrideIterationType, ClearOverrideIterationAction, ClearOverrideIterationType, WorkItemSavedAction, WorkItemSavedActionType, WorkItemSaveFailedActionType, WorkItemSaveFailedAction
} from './actions';

import { WorkItem, WorkItemLink } from 'TFS/WorkItemTracking/Contracts';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';

export const startUpdateWorkItemIteration: ActionCreator<StartUpdateWorkitemIterationAction> =
    (workItem: number, teamIteration: TeamSettingsIteration, override: boolean) => ({
        type: StartUpdateWorkitemIterationActionType,
        payload: {
            workItem,
            teamIteration,
            override
        }
    });

export const workItemSaved: ActionCreator<WorkItemSavedAction> =
    (workItems: number[]) => ({
        type: WorkItemSavedActionType,
        payload: {
            workItems
        }
    });

export const workItemSaveFailed: ActionCreator<WorkItemSaveFailedAction> =
    (workItems: number[], error: string) => ({
        type: WorkItemSaveFailedActionType,
        payload: {
            workItems,
            error
        }
    });


export const changParent: ActionCreator<ChangeParentAction> =
    (workItems: number[], oldParent?: number, newParentId?: number) => ({
        type: ChangeParentActionType,
        payload: {
            workItems,
            oldParent,
            newParentId
        }
    });

export const workItemsReceived: ActionCreator<WorkItemsReceivedAction> =
    (workItems: WorkItem[],
        parentWorkItemIds: number[],
        currentLevelWorkItemIds: number[],
        childLevelWorkItemIds: number[]) => ({
            type: WorkItemsReceivedActionType,
            payload: {
                workItems,
                parentWorkItemIds,
                currentLevelWorkItemIds,
                childLevelWorkItemIds,
            }
        });

export const workItemLinksReceived: ActionCreator<WorkItemLinksReceivedAction> =
    (workItemLinks: WorkItemLink[]) => ({
        type: WorkItemLinksReceivedActionType,
        payload: {
            workItemLinks
        }
    });

export const replaceWorkItems: ActionCreator<ReplaceWorkItemsAction> =
    (workItems: WorkItem[]) => ({
        type: ReplaceWorkItemsActionType,
        payload: {
            workItems
        }
    });


export const launchWorkItemForm: ActionCreator<LaunchWorkItemFormAction> =
    (workItemId: number) => ({
        type: LaunchWorkItemFormActionType,
        track: true,
        payload: {
            workItemId
        }
    });

export const setOverrideIteration: ActionCreator<SetOverrideIterationAction> =
    (workItemId: number, startIterationId: string, endIterationId: string, user: string) => ({
        type: SetOverrideIterationType,
        track: true,
        payload: {
            workItemId,
            startIterationId,
            endIterationId,
            user
        }
    });
export const clearOverrideIteration: ActionCreator<ClearOverrideIterationAction> =
    (id: number) => ({
        type: ClearOverrideIterationType,
        payload: id
    });