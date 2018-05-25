import { call, select, put } from 'redux-saga/effects';
import { getTeamId, settingsStateSelector } from '../selectors';
import { ISettingsState, ProgressTrackingCriteria } from '../store/types';
import { toggleShowWorkItemDetails, changeProgressTrackingCriteria } from '../store/common/actioncreators';

export function* saveSettings() {
    let teamId = yield select(getTeamId);
    let value = yield select(settingsStateSelector());
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);

    value = value ? JSON.stringify(value) : null;
    yield call([dataService, dataService.setValue], `${teamId}_settings`, value, { scopeType: 'User' });
}

export function* restoreSettings() {
    let teamId = yield select(getTeamId);
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);

    const stateString = yield call([dataService, dataService.getValue], `${teamId}_settings`, { scopeType: 'User' });
    if (stateString) {
        const state = JSON.parse(stateString) as ISettingsState;
        yield put(toggleShowWorkItemDetails(state.showWorkItemDetails));
        yield put(changeProgressTrackingCriteria(state.progressTrackingCriteria || ProgressTrackingCriteria.ChildWorkItems));
    }
}