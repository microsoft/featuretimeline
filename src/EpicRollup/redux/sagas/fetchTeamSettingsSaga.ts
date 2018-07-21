
import { WorkHttpClient } from 'TFS/Work/RestClient';
import * as VSS_Service from 'VSS/Service';
import { call, put } from 'redux-saga/effects';
import { getProjectId, getTeamId } from '../../../Common/CommonSelectors';
import { TeamIterationsActionCreator } from '../teamIterations/teamIterationsActions';

export function* fetchTeamIterations() {
    const projectId = getProjectId();
    const teamId = getTeamId();
    const workHttpClient = VSS_Service.getClient(WorkHttpClient);
    const teamContext = { project: projectId, team: teamId };
    const teamIterations = yield call([workHttpClient, workHttpClient.getTeamIterations], teamContext);
    yield put(TeamIterationsActionCreator.teamIterationsReceived(teamId, teamIterations));
}