import { ClearOverrideIterationAction } from "../store/workItems/actions";
import { put, call, select } from "redux-saga/effects";
import { workItemOverrideIterationSelector } from "../selectors";
import { IWorkItemOverrideIteration } from "../store";
import { setOverrideIteration } from "../store/workitems/actionCreators";
import { cleanupOverrideIteration, saveOverrideIteration } from "../store/overrideIterationProgress/actionCreators";
import { OverrideIterationEndAction, SaveOverrideIterationAction } from "../store/overrideIterationProgress/actions";


export function* launchOverrideWorkItemIteration(action: OverrideIterationEndAction) {
    const overrideIterationState: IWorkItemOverrideIteration = yield select(workItemOverrideIterationSelector());
    
    if (!overrideIterationState) {
        return;
    }

    yield put(cleanupOverrideIteration());
    yield put(saveOverrideIteration(overrideIterationState));
}

export function* launchSaveOverrideIteration(action: SaveOverrideIterationAction) {

    const overrideIterationState = action.payload;

    yield put(setOverrideIteration(overrideIterationState.workItemId, overrideIterationState.iterationDuration.startIterationId, overrideIterationState.iterationDuration.endIterationId, overrideIterationState.iterationDuration.user));
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    let currentValues = yield call(dataService.getValue.bind(dataService), "overriddenWorkItemIterations");
    if (currentValues) {
        currentValues = JSON.parse(currentValues);
    } else {
        currentValues = {};
    }
    currentValues[overrideIterationState.workItemId] = {
        startIterationId: overrideIterationState.iterationDuration.startIterationId,
        endIterationId: overrideIterationState.iterationDuration.endIterationId,
        user: overrideIterationState.iterationDuration.user
    };

    yield call(dataService.setValue.bind(dataService), "overriddenWorkItemIterations", JSON.stringify(currentValues));
}

export function* launchClearOverrideIteration(action: ClearOverrideIterationAction) {
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    let currentValues = yield call(dataService.getValue.bind(dataService), "overriddenWorkItemIterations");
    if (currentValues) {
        currentValues = JSON.parse(currentValues);
    } else {
        currentValues = {};
    }
    delete currentValues[action.payload];

    yield call(dataService.setValue.bind(dataService), "overriddenWorkItemIterations", JSON.stringify(currentValues));
}