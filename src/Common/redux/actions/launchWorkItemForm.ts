import { ActionCreator, Action } from 'redux';

export const LaunchWorkItemFormActionType = "@@workitems/LaunchWorkItemForm";
export interface LaunchWorkItemFormAction extends Action {
    type: "@@workitems/LaunchWorkItemForm";
    payload: {
        workItemId: number;
    }
}

export const launchWorkItemForm: ActionCreator<LaunchWorkItemFormAction> = (workItemId: number) => ({
    type: LaunchWorkItemFormActionType,
    track: true,
    payload: {
        workItemId
    }
});