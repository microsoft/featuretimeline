
import { WorkHttpClient } from 'TFS/Work/RestClient';
import * as VSS_Service from 'VSS/Service';
import { call, put } from 'redux-saga/effects';
import { ProjectBacklogConfigurationActionCreator } from '../modules/backlogconfiguration/backlogconfigurationactions';
import { getProjectId } from '../../../Common/CommonSelectors';

export function* fetchBacklogConfiguration() {
    const projectId = getProjectId();
    const workHttpClient = VSS_Service.getClient(WorkHttpClient);
    const teamContext = { project: projectId };
    const backlogConfiguration = yield call([workHttpClient, workHttpClient.getBacklogConfigurations], teamContext);
    yield put(ProjectBacklogConfigurationActionCreator.backlogConfigurationReceived(projectId, backlogConfiguration));
}