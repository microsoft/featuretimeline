import { call } from "redux-saga/effects";
import { IWorkItemFormNavigationService, WorkItemFormNavigationService } from "TFS/WorkItemTracking/Services";
import { LaunchWorkItemFormAction } from "../../../Common/redux/actions/launchWorkItemForm";

export function* launchWorkItemFormSaga(action: LaunchWorkItemFormAction) {
    const workItemNavSvc: IWorkItemFormNavigationService = yield call(WorkItemFormNavigationService.getService);
    yield call(workItemNavSvc.openWorkItem.bind(workItemNavSvc), action.payload.workItemId);
}