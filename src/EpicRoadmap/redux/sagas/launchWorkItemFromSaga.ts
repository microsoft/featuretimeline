import { call, select, put } from "redux-saga/effects";
import { IWorkItemFormNavigationService, WorkItemFormNavigationService } from "TFS/WorkItemTracking/Services";
import { LaunchWorkItemFormAction } from "../../../Common/redux/actions/launchWorkItemForm";
import { getSettingsState } from "../../../Common/redux/modules/SettingsState/SettingsStateSelector";
import { ISettingsState } from "../../../Common/redux/modules/SettingsState/SettingsStateContracts";
import { selectEpic } from "../../../Common/redux/modules/SettingsState/SettingsStateActions";

export function* launchWorkItemFormSaga(action: LaunchWorkItemFormAction) {
    const workItemNavSvc: IWorkItemFormNavigationService = yield call(WorkItemFormNavigationService.getService);
    yield call(workItemNavSvc.openWorkItem.bind(workItemNavSvc), action.payload.workItemId);
    
    // update the data
    const settings: ISettingsState = yield select(getSettingsState);
    yield put(selectEpic(settings.lastEpicSelected));
}