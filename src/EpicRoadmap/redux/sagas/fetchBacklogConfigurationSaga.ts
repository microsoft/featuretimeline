
import { call, put } from 'redux-saga/effects';
import { WorkHttpClient } from 'TFS/Work/RestClient';
import * as VSS_Service from 'VSS/Service';
import { getProjectId } from '../../../Common/redux/Selectors/CommonSelectors';
import { ProjectBacklogConfigurationActionCreator } from '../modules/backlogconfiguration/backlogconfigurationactions';

export function* fetchBacklogConfiguration() {
    const projectId = getProjectId();
    const workHttpClient = VSS_Service.getClient(WorkHttpClient);
    const teamContext = { project: projectId };
    const backlogConfiguration = yield call([workHttpClient, workHttpClient.getBacklogConfigurations], teamContext);
    yield put(ProjectBacklogConfigurationActionCreator.backlogConfigurationReceived(projectId, backlogConfiguration));
}