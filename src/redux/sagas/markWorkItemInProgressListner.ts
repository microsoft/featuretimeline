import * as VSS_Service from 'VSS/Service';
import { StartMarkInProgressAction } from "../store/workitems/actions";
import { put, call } from "redux-saga/effects";
import { WorkItemTrackingHttpClient3_2 } from 'TFS/WorkItemTracking/RestClient';
import { JsonPatchDocument } from 'VSS/WebApi/Contracts';
import { workItemSaved, workItemSaveFailed } from '../store/workitems/actionCreators';

export function* markWorkItemInProgressListner(action: StartMarkInProgressAction) {
    const witHttpClient = VSS_Service.getClient(WorkItemTrackingHttpClient3_2);
    const {
        payload
    } = action;

    try {
        const doc: JsonPatchDocument = [{
            "op": "add",
            "path": "/fields/System.IterationPath",
            "value": payload.teamIteration.path
        }, {
            "op": "add",
            "path": "/fields/System.State",
            "value": payload.state
        }];

        // Update work item Iteration path  and state
        yield call(witHttpClient.updateWorkItem.bind(witHttpClient), doc, action.payload.workItem);
        yield put(workItemSaved([action.payload.workItem]));
    }
    catch (error) {
        yield put(workItemSaveFailed([action.payload.workItem], error));
    }
}
