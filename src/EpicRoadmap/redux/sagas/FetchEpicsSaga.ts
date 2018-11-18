import { call, put, select } from "redux-saga/effects";
import { BacklogConfiguration } from "azure-devops-extension-api/Work";
import { WorkItemTrackingRestClient } from "TFS/WorkItemTracking/RestClient";
import * as VSS_Service from 'VSS/Service';
import { escapeStr } from "../../../Common/redux/Helpers/escape";
import { PageWorkItemHelper } from '../../../Common/redux/Helpers/PageWorkItemHelper';
import { ProgressAwareActionCreator } from "../../../Common/redux/modules/ProgressAwareState/ProgressAwareStateActions";
import { getProjectId, getTeamId } from "../../../Common/redux/Selectors/CommonSelectors";
import { backlogConfigurationForProjectSelector } from "../modules/backlogconfiguration/backlogconfigurationselector";
import { EpicsAvailableCreator } from "../modules/EpicsAvailable/EpicsAvailable";
import { getCommonFields } from './getCommonFields';
import Contracts = require('azure-devops-extension-api/Work');
import WitContracts = require('azure-devops-extension-api/WorkItemTracking');
import { getSettingsState } from "../../../Common/redux/modules/SettingsState/SettingsStateSelector";
import { ISettingsState } from "../../../Common/redux/modules/SettingsState/SettingsStateContracts";
import { selectEpic } from "../../../Common/redux/modules/SettingsState/SettingsStateActions";
import { WorkHttpClient } from "TFS/Work/RestClient";

export function* FetchEpicsSaga() {
    yield put(ProgressAwareActionCreator.setLoading(true));
    const projectId = getProjectId();
    const teamId = getTeamId();
    const workHttpClient = getClient(WorkHttpClient);
    const teamContext = { project: projectId, team: teamId };

    const teamFieldValues = yield call(workHttpClient.getTeamFieldValues.bind(workHttpClient), teamContext);

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

    const teamFieldClause = teamFieldValues.values
    .map((tfValue) => {
        const operator = tfValue.includeChildren ? "UNDER" : "=";
        return `[${escapeStr(teamFieldValues.field.referenceName)}] ${operator} '${escapeStr(tfValue.value)}'`;
    })
    .join(" OR ");
    
    const witHttpClient = getClient(WorkItemTrackingRestClient);
    const wiql = `SELECT [System.Id] 
    FROM WorkItems 
    WHERE ${workItemTypeAndStatesClause} AND ${teamFieldClause}`;

    const queryResults: WitContracts.WorkItemQueryResult = yield call([witHttpClient, witHttpClient.queryByWiql], { query: wiql }, projectId, /* team */ undefined, /*timePrecision? */ undefined, /* top */ 19999);

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