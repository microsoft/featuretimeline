
import { call, put } from 'redux-saga/effects';
import { WorkHttpClient } from 'TFS/Work/RestClient';
import * as VSS_Service from 'VSS/Service';
import { getProjectId, getTeamId } from '../../../Common/redux/Selectors/CommonSelectors';
import { TeamIterationsActionCreator } from '../modules/teamIterations/teamIterationsActions';
import { TeamSettingsActionCreator } from '../modules/teamsettings/teamsettingsactions';

export function* fetchTeamIterations() {
    const projectId = getProjectId();
    const teamId = getTeamId();
    const workHttpClient = getClient(WorkHttpClient);
    const teamContext = { project: projectId, team: teamId };
    const teamIterations = yield call([workHttpClient, workHttpClient.getTeamIterations], teamContext);
    yield put(TeamIterationsActionCreator.teamIterationsReceived(teamId, teamIterations));
}

export function* fetchTeamSettings() {
    const projectId = getProjectId();
    const teamId = getTeamId();
    const workHttpClient = getClient(WorkHttpClient);
    const teamContext = { project: projectId, team: teamId };
    const teamSettings = yield call([workHttpClient, workHttpClient.getTeamSettings], teamContext);
    yield put(TeamSettingsActionCreator.teamSettingsReceived(teamId, teamSettings));
}