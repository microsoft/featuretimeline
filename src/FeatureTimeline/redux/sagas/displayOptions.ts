import { call, select } from 'redux-saga/effects';
import { iterationDisplayOptionsSelector } from '../selectors';
import { getTeamId } from '../../../Common/CommonSelectors';

export function* saveDisplayOptions() {
    const displayOptions = yield select(iterationDisplayOptionsSelector());
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    const value = !displayOptions ? null : JSON.stringify(displayOptions);

    const teamId = yield call(getTeamId);
    yield call([dataService, dataService.setValue], `${teamId}_iterationDisplayOptions`, value, { scopeType: 'User' });
}