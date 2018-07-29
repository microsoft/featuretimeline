import { call, put, select } from "redux-saga/effects";
import { BacklogConfiguration } from "TFS/Work/Contracts";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";
import * as VSS_Service from 'VSS/Service';
import { escapeStr } from "../../../Common/redux/Helpers/escape";
import { PageWorkItemHelper } from '../../../Common/redux/Helpers/PageWorkItemHelper';
import { ProgressAwareActionCreator } from "../../../Common/redux/modules/ProgressAwareState/ProgressAwareStateActions";
import { getProjectId } from "../../../Common/redux/Selectors/CommonSelectors";
import { backlogConfigurationForProjectSelector } from "../modules/backlogconfiguration/backlogconfigurationselector";
import { EpicsAvailableCreator } from "../modules/EpicsAvailable/EpicsAvailable";
import { getCommonFields } from './getCommonFields';
import Contracts = require('TFS/Work/Contracts');
import WitContracts = require('TFS/WorkItemTracking/Contracts');
import { getSettingsState } from "../../../Common/redux/modules/SettingsState/SettingsStateSelector";
import { ISettingsState } from "../../../Common/redux/modules/SettingsState/SettingsStateContracts";
import { selectEpic } from "../../../Common/redux/modules/SettingsState/SettingsStateActions";

export function* FetchEpicsSaga() {
    yield put(ProgressAwareActionCreator.setLoading(true));
    const backlogConfiguration: BacklogConfiguration = yield select(backlogConfigurationForProjectSelector);
    const currentBacklogLevel = backlogConfiguration.portfolioBacklogs[1];
    const stateInfo: Contracts.WorkItemTypeStateInfo[] = backlogConfiguration.workItemTypeMappedStates
        .filter(wtms => currentBacklogLevel.workItemTypes.some(wit => wit.name.toLowerCase() === wtms.workItemTypeName.toLowerCase()));
    const workItemTypeAndStatesClause = stateInfo
        .map(si => {
            const states = Object.keys(si.states)
                .filter(state => si.states[state] === "InProgress" || si.states[state] === "Proposed")
                .map(state => escapeStr(state))
                .join("', '");

            return `(
                         [System.WorkItemType] = '${escapeStr(si.workItemTypeName)}'
                         AND [System.State] IN ('${states}')
                         AND [System.TeamProject] = @project
                        )`;
        }).join(" OR ");

    const projectId = getProjectId();
    const witHttpClient = VSS_Service.getClient(WorkItemTrackingHttpClient);
    const wiql = `SELECT [System.Id] 
    FROM WorkItems 
    WHERE ${workItemTypeAndStatesClause}`;
    const queryResults: WitContracts.WorkItemQueryResult = yield call([witHttpClient, witHttpClient.queryByWiql], { query: wiql }, projectId);

    const epicIds = queryResults.workItems.map(ref => ref.id);
    const workItems = yield PageWorkItemHelper.pageWorkItems(epicIds, projectId, getCommonFields(backlogConfiguration));
    yield put(EpicsAvailableCreator.epicsReceiveed(workItems));
    yield put(ProgressAwareActionCreator.setLoading(false));

    const settings: ISettingsState = yield select(getSettingsState);
    if (settings.lastEpicSelected) {
        yield put(selectEpic(settings.lastEpicSelected));
    }
}

//"SELECT [System.Id] FROM WorkItems WHERE ( [System.WorkItemType] = 'Feature Release' AND [System.State] IN ('Proposed', 'Active') AND [System.TeamProject] = @project ),( [System.WorkItemType] = 'Epic' AND [System.State] IN ('Proposed', 'Active', 'Resolved') AND [System.TeamProject] = @project )"