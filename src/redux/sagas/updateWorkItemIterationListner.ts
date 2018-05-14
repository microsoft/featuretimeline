import * as VSS_Service from 'VSS/Service';
import { StartUpdateWorkitemIterationAction } from "../store/workitems/actions";
import { put, call } from "redux-saga/effects";
import { WorkItemTrackingHttpClient3_2 } from 'TFS/WorkItemTracking/RestClient';
import { JsonPatchDocument } from 'VSS/WebApi/Contracts';
import { workItemSaved, workItemSaveFailed, clearOverrideIteration } from '../store/workitems/actionCreators';
import { saveOverrideIteration } from '../store/overrideIterationProgress/actionCreators';
import { IWorkItemOverrideIteration } from '../store';


export function* updateWorkItemIteration(action: StartUpdateWorkitemIterationAction) {
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

        if (payload.override) {
            const overridePayload: IWorkItemOverrideIteration = {
                workItemId: payload.workItem,
                iterationDuration: {
                    startIterationId: payload.teamIteration.id,
                    endIterationId: payload.teamIteration.id,
                    user: VSS.getWebContext().user.uniqueName
                },
                changingStart: false
            };
            yield put(saveOverrideIteration(overridePayload));
        } else {
            // Clear override iteration if any
            yield put(clearOverrideIteration(payload.workItem));
        }

        // Update work item Iteration path        
        yield call(witHttpClient.updateWorkItem.bind(witHttpClient), doc, action.payload.workItem);
        yield put(workItemSaved([action.payload.workItem]));
    }
    catch (error) {
        yield put(workItemSaveFailed([action.payload.workItem], error));
    }
}
