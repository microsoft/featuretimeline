import { call, put, select } from 'redux-saga/effects';
import { getTeamId } from '../../Selectors/CommonSelectors';
import { restoreSettingsState } from './SettingsStateActions';
import { getSettingsState } from './SettingsStateSelector';
import { ISettingsState } from './SettingsStateContracts';

export function* saveSettings(settingsPrefix: string = "") {
    let teamId = yield select(getTeamId);
    let value = yield select(getSettingsState);

    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    value = value ? JSON.stringify(value) : null;
    yield call([dataService, dataService.setValue], `${settingsPrefix}${teamId}_settings`, value, { scopeType: 'User' });
}

export function* restoreSettings(settingsPrefix: string = "") {
    let teamId = yield select(getTeamId);
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);

    const stateString = yield call([dataService, dataService.getValue], `${settingsPrefix}${teamId}_settings`, { scopeType: 'User' });
    if (stateString) {
        const state = JSON.parse(stateString) as ISettingsState;
        yield put(restoreSettingsState(state));
        return state;
    }

    return null;
}