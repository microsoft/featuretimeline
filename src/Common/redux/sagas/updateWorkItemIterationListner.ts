import { call, put } from "redux-saga/effects";
import { WorkItemTrackingRestClient3_2 } from 'TFS/WorkItemTracking/RestClient';
import * as VSS_Service from 'VSS/Service';
import { JsonPatchDocument } from 'VSS/WebApi/Contracts';
import { StartUpdateWorkitemIterationAction } from "../actions/StartUpdateWorkitemIterationAction";
import { saveOverrideIteration } from '../modules/overrideIterationProgress/overrideIterationProgressActionCreators';
import { IWorkItemOverrideIteration } from '../modules/OverrideIterations/overriddenIterationContracts';
import { OverriddenIterationsActionCreator } from '../modules/OverrideIterations/overrideIterationsActions';

export function* updateWorkItemIteration(action: StartUpdateWorkitemIterationAction) {
    const witHttpClient = getClient(WorkItemTrackingRestClient3_2);
    const {
        payload
    } = action;
    try {
        const doc: JsonPatchDocument = [{
            "op": "add",
            "path": "/fields/System.IterationPath",
            "value": payload.teamIteration.path || payload.teamIteration.name
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
            yield put(OverriddenIterationsActionCreator.clear(payload.workItem));
        }

        // Update work item Iteration path        
        yield call(witHttpClient.updateWorkItem.bind(witHttpClient), doc, action.payload.workItem);
    }
    catch (error) {
        
    }
}
