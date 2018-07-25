import * as VSS_Service from 'VSS/Service';
import { StartMarkInProgressAction } from "../store/workitems/actions";
import { call } from "redux-saga/effects";
import { WorkItemTrackingHttpClient3_2 } from 'TFS/WorkItemTracking/RestClient';
import { JsonPatchDocument } from 'VSS/WebApi/Contracts';

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
        }];

        // Update work item Iteration path  and state
        yield call(witHttpClient.updateWorkItem.bind(witHttpClient), doc, action.payload.workItem);
    }
    catch (error) {
        
    }
}
