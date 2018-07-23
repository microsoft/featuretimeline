import * as VSS_Service from 'VSS/Service';
import { StartUpdateWorkitemIterationAction } from "../../FeatureTimeline/redux/store/workitems/actions";
import { put, call } from "redux-saga/effects";
import { WorkItemTrackingHttpClient3_2 } from 'TFS/WorkItemTracking/RestClient';
import { JsonPatchDocument } from 'VSS/WebApi/Contracts';
import { workItemSaved, workItemSaveFailed } from '../../FeatureTimeline/redux/store/workitems/actionCreators';
import { OverriddenIterationsActionCreator } from '../modules/OverrideIterations/overrideIterationsActions';
import { IWorkItemOverrideIteration } from '../modules/OverrideIterations/overriddenIterationContracts';
import { saveOverrideIteration } from '../overrideIterationProgress/actionCreators';


export function* updateWorkItemIteration(action: StartUpdateWorkitemIterationAction) {
    const witHttpClient = VSS_Service.getClient(WorkItemTrackingHttpClient3_2);
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
        yield put(workItemSaved([action.payload.workItem]));
    }
    catch (error) {
        yield put(workItemSaveFailed([action.payload.workItem], error));
    }
}
