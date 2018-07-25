import { call, put } from "redux-saga/effects";
import { OverriddenIterationsActionCreator } from './overrideIterationsActions';

export function* restoreOverriddenIterations() {
    const dataService
        = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);

    const overriddenIterations: string =
        yield call([dataService, dataService.getValue],
            "overriddenWorkItemIterations");

    yield put(OverriddenIterationsActionCreator.restore(overriddenIterations ? JSON.parse(overriddenIterations) : null));
}