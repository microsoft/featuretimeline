import { call, put } from "redux-saga/effects";
import { IOverriddenIterationDuration } from "./overriddenIterationContracts";
import { OverriddenIterationsActionCreator } from './overrideIterationsActions';

export function* restoreOverriddenIterations() {
    const dataService
        = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);

    const overriddenIterations: IDictionaryNumberTo<IOverriddenIterationDuration> =
        yield call([dataService, dataService.getValue],
            "overriddenWorkItemIterations");

    yield put(OverriddenIterationsActionCreator.restore(overriddenIterations));
}