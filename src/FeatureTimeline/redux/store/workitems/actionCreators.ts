import { ActionCreator } from 'redux';
import { TeamSettingsIteration, WorkItemTypeStateInfo } from 'TFS/Work/Contracts';
import { WorkItem, WorkItemLink } from 'TFS/WorkItemTracking/Contracts';
import { ChangeParentAction, ChangeParentActionType, StartMarkInProgressAction, StartMarkInProgressActionType, StartUpdateWorkitemIterationAction, StartUpdateWorkitemIterationActionType, WorkItemLinksReceivedAction, WorkItemLinksReceivedActionType, WorkItemSavedAction, WorkItemSavedActionType, WorkItemSaveFailedAction, WorkItemSaveFailedActionType, WorkItemsReceivedAction, WorkItemsReceivedActionType } from './actions';


export const startUpdateWorkItemIteration: ActionCreator<StartUpdateWorkitemIterationAction> =
    (workItem: number, teamIteration: TeamSettingsIteration, override: boolean) => ({
        type: StartUpdateWorkitemIterationActionType,
        payload: {
            workItem,
            teamIteration,
            override
        }
    });

export const startMarkInProgress: ActionCreator<StartMarkInProgressAction> =
    (workItem: number, teamIteration: TeamSettingsIteration, state: string) => ({
        type: StartMarkInProgressActionType,
        payload: {
            workItem,
            teamIteration,
            state
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
        childLevelWorkItemIds: number[],
        workItemTypeStateInfo: WorkItemTypeStateInfo[]) => ({
            type: WorkItemsReceivedActionType,
            payload: {
                workItems,
                parentWorkItemIds,
                currentLevelWorkItemIds,
                childLevelWorkItemIds,
                workItemTypeStateInfo
            }
        });

export const workItemLinksReceived: ActionCreator<WorkItemLinksReceivedAction> =
    (workItemLinks: WorkItemLink[]) => ({
        type: WorkItemLinksReceivedActionType,
        payload: {
            workItemLinks
        }
    });


