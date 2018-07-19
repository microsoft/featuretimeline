
import { WorkHttpClient } from 'TFS/Work/RestClient';
import * as VSS_Service from 'VSS/Service';
import { call, put } from 'redux-saga/effects';

function* fetchBacklogConfiguration(projectId: string) {
    const workHttpClient = VSS_Service.getClient(WorkHttpClient);
    const teamContext = { project: projectId };
    const backlogConfiguration = yield call([workHttpClient, workHttpClient.getBacklogConfigurations], teamContext);
}