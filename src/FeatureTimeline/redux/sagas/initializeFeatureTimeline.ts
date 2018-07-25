import { all, call, put, select } from 'redux-saga/effects';
import { WorkHttpClient } from 'TFS/Work/RestClient';
import { WorkItemTrackingHttpClient } from 'TFS/WorkItemTracking/RestClient';
import * as VSS_Service from 'VSS/Service';
import { PageWorkItemHelper } from '../../../Common/redux/Helpers/PageWorkItemHelper';
import { restoreOverriddenIterations } from '../../../Common/redux/modules/OverrideIterations/overriddenIterationsSaga';
import { getProjectId, getTeamId } from '../../../Common/redux/Selectors/CommonSelectors';
import { workItemStateColorsReceived, workItemTypesReceived } from '../../../EpicRoadmap/redux/modules/workItemMetadata/workItemMetadataActionCreators';
import { WorkItemMetadataService } from '../../../Services/WorkItemMetadataService';
import { getBacklogLevel } from '../selectors';
import { backlogConfigurationReceived } from '../store/backlogconfiguration/actionCreators';
import { createInitialize } from '../store/common/actioncreators';
import { InitializeAction } from '../store/common/actions';
import { genericError } from '../store/error/actionCreators';
import { loading } from '../store/loading/actionCreators';
import { teamSettingsIterationReceived } from '../store/teamiterations/actionCreators';
import { teamSettingsReceived } from '../store/teamSettings/actionCreators';
import { workItemLinksReceived, workItemsReceived } from '../store/workitems/actionCreators';
import { restoreSettings } from '../../../Common/redux/modules/SettingsState/SettingsStateSagas';
import Contracts = require('TFS/Work/Contracts');
import WitContracts = require('TFS/WorkItemTracking/Contracts');
import TFS_Core_Contracts = require('TFS/Core/Contracts');
import { fetchIterationDisplayOptions } from '../../../Common/redux/modules/IterationDisplayOptions/iterationDisplayOptionsSaga';
import { ISettingsState } from '../../../Common/redux/modules/SettingsState/SettingsStateContracts';

// For sagas read  https://redux-saga.js.org/docs/introduction/BeginnerTutorial.html
// For details saga effects read https://redux-saga.js.org/docs/basics/DeclarativeEffects.html

export function* launchInitialize() {
    const projectId = yield select(getProjectId);
    const teamId = yield select(getTeamId);
    const backlogLevelName = yield select(getBacklogLevel);
    const initializeAction = yield call(createInitialize, projectId, teamId, backlogLevelName);
    yield put(initializeAction)
}

// Setup to call initialize saga for every initialize action
export function* callInitialize(action: InitializeAction) {
    yield put(loading(true));
    yield call(handleInitialize, action);
    yield put(loading(false));
}

export function* handleInitialize(action: InitializeAction) {
    const {
        projectId,
        teamId
    } = action.payload;
    const teamContext = {
        teamId,
        projectId
    } as TFS_Core_Contracts.TeamContext;

    const workHttpClient = VSS_Service.getClient(WorkHttpClient);
    const metadataService = WorkItemMetadataService.getInstance();
    const witHttpClient = VSS_Service.getClient(WorkItemTrackingHttpClient);
    if (!workHttpClient.getBacklogConfigurations) {
        yield put(genericError("This extension is supported on Team Foundation Server 2018 or above."));
        return;
    }

    try {
        // Fetch backlog config, team iterations, workItem types and state metadata in parallel
        const [bc, tis, wits, ts, tfv] = yield all([
            call(workHttpClient.getBacklogConfigurations.bind(workHttpClient), teamContext),
            call(workHttpClient.getTeamIterations.bind(workHttpClient), teamContext),
            call(metadataService.getWorkItemTypes.bind(metadataService), projectId),
            call(workHttpClient.getTeamSettings.bind(workHttpClient), teamContext),
            call(workHttpClient.getTeamFieldValues.bind(workHttpClient), teamContext),
            call(fetchIterationDisplayOptions, teamId)
        ]);

        yield call(restoreOverriddenIterations);
        yield put(backlogConfigurationReceived(projectId, teamId, bc));
        yield put(teamSettingsReceived(projectId, teamId, ts));
        yield put(teamSettingsIterationReceived(projectId, teamId, tis));
        yield put(workItemTypesReceived(projectId, wits));

        const backlogConfig: Contracts.BacklogConfiguration = bc;
        const teamSettings: Contracts.TeamSetting = ts;
        const teamFieldValues: Contracts.TeamFieldValues = tfv;

        // For now show only lowest level of portfolio backlog
        const workItemTypeNames = [];
        backlogConfig.portfolioBacklogs.reduce((workItemTypeNames, backlog) => {
            workItemTypeNames.push(...backlog.workItemTypes.map(w => w.name));
            return workItemTypeNames;
        }, workItemTypeNames);

        workItemTypeNames.push(...backlogConfig.requirementBacklog.workItemTypes.map(w => w.name));

        const stateColors = yield call([metadataService, metadataService.getStates], projectId, workItemTypeNames);
        yield put(workItemStateColorsReceived(projectId, stateColors));

        const wiql = yield call(getBacklogLevelQueryWiql, backlogConfig, teamSettings, teamFieldValues, "InProgress");
        const queryResults: WitContracts.WorkItemQueryResult = yield call([witHttpClient, witHttpClient.queryByWiql], { query: wiql }, projectId);

        const queryResultWits = [];
        if (queryResults && queryResults.workItems) {
            queryResultWits.push(...queryResults.workItems);
        }

        // query closed work items
        let settings: ISettingsState = yield call(restoreSettings);
        if (settings && settings.showClosedSinceDays && settings.showClosedSinceDays > 0) {
            const extraCondition = ` AND [Microsoft.VSTS.Common.ClosedDate] >= @Today -${settings.showClosedSinceDays}`

            const wiql = yield call(getBacklogLevelQueryWiql, backlogConfig, teamSettings, teamFieldValues, "Completed", extraCondition);

            const queryResults: WitContracts.WorkItemQueryResult = yield call([witHttpClient, witHttpClient.queryByWiql], { query: wiql }, projectId, /** team**/ null, /* teamPrecision */ null, /*top*/ 100);
            if (queryResults && queryResults.workItems) {
                // Page only first 100 proposed items for optimization
                queryResultWits.push(...queryResults.workItems);
            }
        }

        // query for Proposed work items
        {
            const wiql = yield call(getBacklogLevelQueryWiql, backlogConfig, teamSettings, teamFieldValues, "Proposed");
            const queryResults: WitContracts.WorkItemQueryResult = yield call([witHttpClient, witHttpClient.queryByWiql], { query: wiql }, projectId, /** team**/ null, /* teamPrecision */ null, /*top*/ 100);

            if (queryResults && queryResults.workItems) {
                // Page only first 100 proposed items for optimization
                queryResultWits.push(...queryResults.workItems);
            }
        }

        const currentBacklogLevel = backlogConfig.portfolioBacklogs[0];
        const orderField = backlogConfig.backlogFields.typeFields["Order"];
        const effortField = backlogConfig.backlogFields.typeFields["Effort"];

        // Get work items for backlog level
        const backlogLevelWorkItemIds: number[] = [];
        let childWorkItemIds: number[] = [];
        let parentWorkItemIds: number[] = [];
        let workItemsToPage: number[] = [];

        // Get child work items and page all work items
        if (queryResultWits.length > 0) {

            const potentialBacklogLevelWorkItemIds = queryResultWits.map(w => w.id);

            let pagedWorkItems = yield call(_pageWorkItemFields, potentialBacklogLevelWorkItemIds, [orderField]);

            // pagedWorkItems = pagedWorkItems.filter((wi) => _isInProgress(wi, bc));

            const childBacklogLevel = yield call(_findChildBacklogLevel, currentBacklogLevel, bc);
            const parentBacklogLevel = yield call(_findParentBacklogLevel, currentBacklogLevel, bc);
            backlogLevelWorkItemIds.push(...pagedWorkItems.map((wi) => wi.id));

            const childQueryResult: WitContracts.WorkItemQueryResult = yield call(_runChildWorkItemQuery, backlogLevelWorkItemIds, projectId, backlogConfig, childBacklogLevel);
            if (childQueryResult && childQueryResult.workItemRelations) {
                childWorkItemIds = childQueryResult.workItemRelations
                    .filter(link => link.target && link.rel)
                    .map((link) => link.target.id);
                workItemsToPage.push(...childWorkItemIds);
            }

            let parentLinks = [];
            if (parentBacklogLevel) {
                const parentQueryResult: WitContracts.WorkItemQueryResult = yield call(_runParentWorkItemQuery, backlogLevelWorkItemIds, projectId, parentBacklogLevel);
                parentLinks = parentQueryResult ? parentQueryResult.workItemRelations : [];
            }

            // Before changing the logic here test TFS2017
            parentWorkItemIds = parentLinks
                .filter(link => link.target && link.source && link.target.id && link.source.id)
                .map((link) => link.target.id);
            workItemsToPage.push(...parentWorkItemIds);

            const workItems: WitContracts.WorkItem[] = yield call(_pageWorkItemFields, workItemsToPage, [effortField, orderField]);
            workItems.push(...pagedWorkItems);
            workItems.sort((w1, w2) => w1.fields[orderField] - w2.fields[orderField]);
            // Call action creators to update work items and links in the store
            yield put(workItemsReceived(workItems, parentWorkItemIds, backlogLevelWorkItemIds, childWorkItemIds, backlogConfig.workItemTypeMappedStates));

            const linksReceived = childQueryResult ? childQueryResult.workItemRelations : [];
            linksReceived.push(...parentLinks);
            yield put(workItemLinksReceived(linksReceived));


        }        
    } catch (error) {
        yield put(genericError(error));
    }
}

function getBacklogLevelQueryWiql(
    backlogConfig: Contracts.BacklogConfiguration,
    teamSettings: Contracts.TeamSetting,
    teamFieldValues: Contracts.TeamFieldValues,
    stateCategory: string,
    extraCondition: string = null) {

    const currentBacklogLevel = backlogConfig.portfolioBacklogs[0];
    const orderField = backlogConfig.backlogFields.typeFields["Order"];
    const workItemTypes = currentBacklogLevel.workItemTypes.map(w => `'${w.name}'`).join(",");

    let backlogIteration = teamSettings.backlogIteration.path || teamSettings.backlogIteration.name;
    if (backlogIteration[0] === "\\") {
        const webContext = VSS.getWebContext();
        backlogIteration = webContext.project.name + backlogIteration;
    }
    backlogIteration = _escape(backlogIteration);

    const stateInfo: Contracts.WorkItemTypeStateInfo[] = backlogConfig.workItemTypeMappedStates
        .filter(wtms => currentBacklogLevel.workItemTypes.some(wit => wit.name.toLowerCase() === wtms.workItemTypeName.toLowerCase()));
    const workItemTypeAndStatesClause = stateInfo
        .map(si => {
            const states = Object.keys(si.states)
                .filter(state => si.states[state] === stateCategory)
                .map(state => _escape(state))
                .join("', '");

            return `(
                             [System.WorkItemType] = '${_escape(si.workItemTypeName)}'
                             AND [System.State] IN ('${states}')
                            )`;
        })
        .join(" OR ");

    const teamFieldClause = teamFieldValues.values
        .map((tfValue) => {
            const operator = tfValue.includeChildren ? "UNDER" : "=";
            return `[${_escape(teamFieldValues.field.referenceName)}] ${operator} '${_escape(tfValue.value)}'`;
        })
        .join(" OR ");

    const wiql = `SELECT   System.Id
                        FROM     WorkItems
                        WHERE    [System.WorkItemType] IN (${workItemTypes})
                        AND      [System.IterationPath] UNDER '${backlogIteration}'
                        AND      (${workItemTypeAndStatesClause})
                        AND      (${teamFieldClause})
                        ${extraCondition || ""}
                        ORDER BY [${orderField}] ASC,[System.Id] ASC`;
    return wiql;
}

function _escape(value: string): string {
    return value.replace("'", "''");
}

// function _isInProgress(workItem: WitContracts.WorkItem, backlogConfig: Contracts.BacklogConfiguration) {
//     return (backlogConfig.workItemTypeMappedStates.find((t) => t.workItemTypeName == workItem.fields["System.WorkItemType"]).states[workItem.fields["System.State"]] === "InProgress");
// }

function _findChildBacklogLevel(
    backlogLevel: Contracts.BacklogLevelConfiguration,
    backlogConfig: Contracts.BacklogConfiguration):
    Contracts.BacklogLevelConfiguration {
    let childBacklogLevel = backlogConfig.portfolioBacklogs.find((level) => level.rank < backlogLevel.rank);
    if (childBacklogLevel) {
        return childBacklogLevel;
    }
    return backlogConfig.requirementBacklog;
}

function _findParentBacklogLevel(
    backlogLevel: Contracts.BacklogLevelConfiguration,
    backlogConfig: Contracts.BacklogConfiguration):
    Contracts.BacklogLevelConfiguration {

    let parentBacklogLevel = backlogConfig
        .portfolioBacklogs
        .filter((level) => level.rank > backlogLevel.rank)
        .sort((b1, b2) => b1.rank - b2.rank)[0];

    if (parentBacklogLevel) {
        return parentBacklogLevel;
    }
    return null;
}

async function _runChildWorkItemQuery(
    ids: number[],
    project: string,
    backlogConfig: Contracts.BacklogConfiguration,
    backlogLevel: Contracts.BacklogLevelConfiguration):
    Promise<WitContracts.WorkItemQueryResult> {
    if (!ids || ids.length === 0) {
        return Promise.resolve(null);
    }

    const idClause = ids.join(",");
    const stateInfo: Contracts.WorkItemTypeStateInfo[] = backlogConfig.workItemTypeMappedStates
        .filter(wtms => backlogLevel.workItemTypes.some(wit => wit.name.toLowerCase() === wtms.workItemTypeName.toLowerCase()));
    const workItemTypeAndStatesClause = stateInfo
        .map(si => {
            const states = Object.keys(si.states).filter(state => si.states[state] !== "Removed")
                .map(state => _escape(state))
                .join("', '");
            return `(
                Target.[System.WorkItemType] = '${_escape(si.workItemTypeName)}'
                             AND Target.[System.State] IN ('${states}')
                            )`;
        }).join(" OR ");

    const wiql =
        `SELECT [System.Id]
     FROM WorkItemLinks 
     WHERE   (Source.[System.TeamProject] = @project and Source.[System.Id] in (${idClause})) 
         AND ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward')
         AND (Target.[System.TeamProject] = @project and ${workItemTypeAndStatesClause})  
     MODE (MayContain)`;
    const witHttpClient = VSS_Service.getClient(WorkItemTrackingHttpClient);
    return witHttpClient.queryByWiql({ query: wiql }, project);
}

async function _runParentWorkItemQuery(
    ids: number[],
    project: string,
    backlogLevel: Contracts.BacklogLevelConfiguration):
    Promise<WitContracts.WorkItemQueryResult> {
    if (!ids || ids.length === 0) {
        return Promise.resolve(null);
    }

    const idClause = ids.join(",");
    const witClause = backlogLevel.workItemTypes.map(wit => "'" + wit.name + "'").join(",");
    const wiql =
        `SELECT [System.Id]
     FROM WorkItemLinks 
     WHERE   (Source.[System.TeamProject] = @project and Source.[System.Id] in (${idClause})) 
         AND ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Reverse')
         AND (Target.[System.TeamProject] = @project and Target.[System.WorkItemType] in (${witClause}))  
     MODE (MayContain)`;
    const witHttpClient = VSS_Service.getClient(WorkItemTrackingHttpClient);
    return witHttpClient.queryByWiql({ query: wiql }, project);
}

async function _pageWorkItemFields(
    ids: number[],
    fields: string[]): Promise<WitContracts.WorkItem[]> {
    if (!ids || ids.length === 0) {
        return Promise.resolve([]);
    }

    const commonFields = [
        "System.Id",
        "System.Title",
        "System.State",
        "System.WorkItemType",
        "System.IterationPath"
    ];
    commonFields.push(...fields);
    return PageWorkItemHelper.pageWorkItems(ids, /* projectName */ null, commonFields);
}
