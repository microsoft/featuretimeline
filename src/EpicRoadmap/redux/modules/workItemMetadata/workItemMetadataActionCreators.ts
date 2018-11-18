import { ActionCreator } from 'redux';
import { WorkItemTypesReceivedAction, WorkItemTypesReceivedActionType, WorkItemStateColorsReceivedAction, WorkItemStateColorsReceivedActionType } from './workItemMetadataActions';
import { WorkItemType, WorkItemStateColor } from 'azure-devops-extension-api/WorkItemTracking';
import { IDictionaryStringTo } from '../../../../Common/redux/Contracts/types';

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