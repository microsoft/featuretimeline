import { call, put } from "redux-saga/effects";
import { IIterationDisplayOptions } from "../../Contracts/GridViewContracts";
import { restoreDisplayIterationCount } from "./IterationDisplayOptionsActions";

export function* fetchIterationDisplayOptions(teamId: string, settingsPrefix: string = "") {
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    const iterationDisplayOptions = yield call([dataService, dataService.getValue],
        `${settingsPrefix}${teamId}_iterationDisplayOptions`, { scopeType: 'User' });

    if (iterationDisplayOptions && iterationDisplayOptions !== "null") {
        console.log(`parsed iteration displayoptions`, JSON.parse(iterationDisplayOptions));
        yield put(restoreDisplayIterationCount(JSON.parse(iterationDisplayOptions)));
    }
}

export function* saveIterationDisplayOptions(
    teamId: string,
    iterationDisplayOptions: IIterationDisplayOptions,
    settingsPrefix: string = "") {
        debugger;
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    const value = !iterationDisplayOptions ? null : JSON.stringify(iterationDisplayOptions);
    yield call([dataService, dataService.setValue],
        `${settingsPrefix}${teamId}_iterationDisplayOptions`,
        value,
        { scopeType: 'User' });
}

