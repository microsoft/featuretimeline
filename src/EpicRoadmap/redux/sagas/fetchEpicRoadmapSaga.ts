import { call, put, select } from "redux-saga/effects";
import { BacklogConfiguration } from 'TFS/Work/Contracts';
import { WorkItemTrackingHttpClient } from 'TFS/WorkItemTracking/RestClient';
import * as VSS_Service from 'VSS/Service';
import { ActionWithPayload } from "../../../Common/redux/Helpers/ActionHelper";
import { PageWorkItemHelper } from '../../../Common/redux/Helpers/PageWorkItemHelper';
import { restoreOverriddenIterations } from '../../../Common/redux/modules/OverrideIterations/overriddenIterationsSaga';
import { ProgressAwareActionCreator } from "../../../Common/redux/modules/ProgressAwareState/ProgressAwareStateActions";
import { getProjectId } from '../../../Common/redux/Selectors/CommonSelectors';
import { backlogConfigurationForProjectSelector } from "../modules/backlogconfiguration/backlogconfigurationselector";
import { WorkItemsActionCreator } from '../modules/workItems/workItemActions';
import { getCommonFields } from "./getCommonFields";
import WitContracts = require('TFS/WorkItemTracking/Contracts');

export function* fetchEpicRoadmap(action: ActionWithPayload<"@@common/selectepic", number>) {
    try {
        const projectId = getProjectId();
        yield put(ProgressAwareActionCreator.setLoading(true));
        const backlogConfiguration: BacklogConfiguration = yield select(backlogConfigurationForProjectSelector);


        // get all children including grand children
        // Target is child and source is parent
        const parentChildWiql = `SELECT [System.Id] 
                FROM WorkItemLinks 
                WHERE (Source.[System.Id] IN(${ action.payload}) )
                    AND [System.Links.LinkType] IN ('System.LinkTypes.Hierarchy-Forward')
                    AND Target.[System.WorkItemType] <> '' mode(Recursive)`;

        const witHttpClient = VSS_Service.getClient(WorkItemTrackingHttpClient);
        const parentChildQueryResults: WitContracts.WorkItemQueryResult = yield call([witHttpClient, witHttpClient.queryByWiql], { query: parentChildWiql }, projectId);

        yield put(WorkItemsActionCreator.epicHierarchyReceived(parentChildQueryResults.workItemRelations));

        const workItemIds: number[] = parentChildQueryResults.workItemRelations.map(rel => rel.target.id);
        // Source is successor target is predecessor
        const dependenciesWiql = `SELECT [System.Id] 
                                FROM WorkItemLinks 
                                WHERE (Source.[System.Id] IN(${ workItemIds.join(",")}) )
                                    AND [System.Links.LinkType] IN ('System.LinkTypes.Dependency-Reverse')
                                    AND Target.[System.WorkItemType] <> ''`;

        const dependenciesQueryResult: WitContracts.WorkItemQueryResult = yield call([witHttpClient, witHttpClient.queryByWiql], { query: dependenciesWiql }, projectId);
        yield put(WorkItemsActionCreator.dependenciesReceived(dependenciesQueryResult.workItemRelations));

        const predecessorWorkItemIds = dependenciesQueryResult.workItemRelations.map(rel => rel.target.id);

        // check if there are any dependencies that are cross epic, if any filter them out and show message
        // const crossEpicDependencies = predecessorWorkItemIds.filter(pwit => !workItemIds.some(w => w === pwit));
        const fields = getCommonFields(backlogConfiguration);

        const pagedWorkItems: WitContracts.WorkItem[] = yield call(PageWorkItemHelper.pageWorkItems, workItemIds.concat(predecessorWorkItemIds), projectId, fields);
        yield put(WorkItemsActionCreator.pagedWorkItemsReceived(pagedWorkItems));

        // Fetch overridden iteration start/end dates
        yield call(restoreOverriddenIterations);

        yield put(ProgressAwareActionCreator.setLoading(false));
    }
    catch (error) {
        yield put(ProgressAwareActionCreator.setError(error));
    }

}