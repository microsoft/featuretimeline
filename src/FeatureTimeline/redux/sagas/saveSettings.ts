import { call, put, select } from 'redux-saga/effects';
import { ISettingsState } from "../../../Common/Contracts/OptionsInterfaces";
import { getTeamId } from '../../../Common/Selectors/CommonSelectors';
import { settingsStateSelector } from '../selectors';
import { restoreSettingsState } from '../store/common/actioncreators';
import { ChangeShowClosedSinceDaysType, SettingsActions } from '../store/common/actions';
import { launchInitialize } from './initializeFeatureTimeline';

export function* saveSettings(action: SettingsActions) {
    let teamId = yield select(getTeamId);
    let value = yield select(settingsStateSelector());

    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);
    value = value ? JSON.stringify(value) : null;
    yield call([dataService, dataService.setValue], `${teamId}_settings`, value, { scopeType: 'User' });

    if (action && action.type === ChangeShowClosedSinceDaysType) {
        yield call(launchInitialize);
    }
}

export function* restoreSettings() {
    let teamId = yield select(getTeamId);
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);

    const stateString = yield call([dataService, dataService.getValue], `${teamId}_settings`, { scopeType: 'User' });
    if (stateString) {
        const state = JSON.parse(stateString) as ISettingsState;
        yield put(restoreSettingsState(state));
        return state;
    }

    return null;
}