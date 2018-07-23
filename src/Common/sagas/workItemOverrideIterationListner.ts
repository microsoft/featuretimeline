import { put, call, select } from "redux-saga/effects";
import { workItemOverrideIterationSelector } from "../../FeatureTimeline/redux/selectors";
import { OverriddenIterationsActionCreator } from "../modules/OverrideIterations/overrideIterationsActions";
import { AnyAction } from 'redux';
import { IWorkItemOverrideIteration } from "../modules/OverrideIterations/overriddenIterationContracts";
import { OverrideIterationEndAction, SaveOverrideIterationAction } from "../modules/overrideIterationProgress/actions";
import { cleanupOverrideIteration, saveOverrideIteration } from "../modules/overrideIterationProgress/actionCreators";


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

    yield put(OverriddenIterationsActionCreator.set(overrideIterationState.workItemId, overrideIterationState.iterationDuration));
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

export function* launchClearOverrideIteration(action: AnyAction) {
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