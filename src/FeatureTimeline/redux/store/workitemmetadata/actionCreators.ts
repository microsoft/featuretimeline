import { ActionCreator } from 'redux';
import { WorkItemTypesReceivedAction, WorkItemTypesReceivedActionType, WorkItemStateColorsReceivedAction, WorkItemStateColorsReceivedActionType } from './actions';
import { WorkItemType, WorkItemStateColor } from 'TFS/WorkItemTracking/Contracts';

export const workItemTypesReceived: ActionCreator<WorkItemTypesReceivedAction> =
    (projectId: string, workItemTypes: WorkItemType[]) => ({
        type: WorkItemTypesReceivedActionType,
        payload: {
            projectId,
            workItemTypes
        }
    });


export const workItemStateColorsReceived: ActionCreator<WorkItemStateColorsReceivedAction> =
    (projectId: string, workItemTypeStateColors: IDictionaryStringTo<WorkItemStateColor[]>) => ({
        type: WorkItemStateColorsReceivedActionType,
        payload: {
            projectId,
            workItemTypeStateColors
        }
    });