import { call, put } from "redux-saga/effects";
import { IWorkItemFormNavigationService, WorkItemFormNavigationService } from "TFS/WorkItemTracking/Services";
import { LaunchWorkItemFormAction } from "../../../Common/redux/actions/launchWorkItemForm";
import { getProjectId, getTeamId } from "../../../Common/redux/Selectors/CommonSelectors";
import { getBacklogLevel } from "../selectors";
import { createInitialize, resetAllData } from "../store/common/actioncreators";


export function* launchWorkItemFormSaga(action: LaunchWorkItemFormAction) {
    const workItemNavSvc: IWorkItemFormNavigationService = yield call(WorkItemFormNavigationService.getService);
    yield call(workItemNavSvc.openWorkItem.bind(workItemNavSvc), action.payload.workItemId);

    // TODO: At this point the workitem returned after the update does not have
    // updated links so we do not have a way to identify if any of the links changed
    // our best bet is to update the workitems and relations by reinitializing
    const projectId = getProjectId();
    const teamId = getTeamId();
    const backlogLevelName = getBacklogLevel();

    yield put(resetAllData());
    yield put(createInitialize(projectId, teamId, backlogLevelName));
}