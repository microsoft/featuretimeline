import { LaunchWorkItemFormAction } from "../store/workitems/actions";
import { put, call } from "redux-saga/effects";
import { WorkItemFormNavigationService, IWorkItemFormNavigationService } from "TFS/WorkItemTracking/Services";
import { createInitialize, resetAllData } from "../store/common/actioncreators";
import { getProjectId, getTeamId, getBacklogLevel } from "../selectors";


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