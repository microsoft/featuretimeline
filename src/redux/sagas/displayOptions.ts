import { call, select } from 'redux-saga/effects';
import { iterationDisplayOptionsSelector } from '../selectors';

export function* saveDisplayOptions() {
    const displayOptions = yield select(iterationDisplayOptionsSelector());
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    const value = !displayOptions ? null : JSON.stringify(displayOptions);
    yield call([dataService, dataService.setValue], "iterationDisplayOptions", value, { scopeType: 'User' });
}