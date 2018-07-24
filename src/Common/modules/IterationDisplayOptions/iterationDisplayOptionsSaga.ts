import { call } from "redux-saga/effects";
import { IIterationDisplayOptions } from "../../Contracts/GridViewContracts";

export function* fetchIterationDisplayOptions(teamId: string, settingsPrefix: string = "") {
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    return call([dataService, dataService.getValue],
        `${settingsPrefix}${teamId}_iterationDisplayOptions`, { scopeType: 'User' });
}

export function* saveIterationDisplayOptions(
    teamId: string,     
    iterationDisplayOptions: IIterationDisplayOptions,
    settingsPrefix: string = "") {
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    const value = !iterationDisplayOptions ? null : JSON.stringify(iterationDisplayOptions);
    return call([dataService, dataService.setValue],
        `${settingsPrefix}${teamId}_iterationDisplayOptions`,
        value,
        { scopeType: 'User' });
}

