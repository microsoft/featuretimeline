import { ActionCreator } from 'redux';
import { TeamSettingsIteration, WorkItemTypeStateInfo } from 'azure-devops-extension-api/Work';
import { WorkItem, WorkItemLink } from 'azure-devops-extension-api/WorkItemTracking';
import { ChangeParentAction, ChangeParentActionType, StartMarkInProgressAction, StartMarkInProgressActionType, WorkItemLinksReceivedAction, WorkItemLinksReceivedActionType, WorkItemsReceivedAction, WorkItemsReceivedActionType } from './actions';


export const startMarkInProgress: ActionCreator<StartMarkInProgressAction> =
    (workItem: number, teamIteration: TeamSettingsIteration, state: string) => ({
        type: StartMarkInProgressActionType,
        payload: {
            workItem,
            teamIteration,
            state
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


