import { call, put, select } from 'redux-saga/effects';
import { getTeamId } from '../../../Common/redux/Selectors/CommonSelectors';
import { planFeatureStateSelector } from '../selectors';
import { changePlanFeaturesFilter, changePlanFeaturesWidth, togglePlanFeaturesPane } from '../store/common/actioncreators';
import { IPlanFeaturesState } from '../store/types';

export function* savePlanFeaturesDisplayOptions() {
    let teamId = yield select(getTeamId);
    let value = yield select(planFeatureStateSelector());
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);

    value = value ? JSON.stringify(value) : null;
    yield call([dataService, dataService.setValue], `${teamId}_planFeaturesDisplayOptions`, value, { scopeType: 'User' });
}

export function* restorePlanFeaturesDisplayOptions() {
    let teamId = yield select(getTeamId);
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);

    const stateString = yield call([dataService, dataService.getValue], `${teamId}_planFeaturesDisplayOptions`, { scopeType: 'User' });
    if (stateString) {
        const state = JSON.parse(stateString) as IPlanFeaturesState;
        yield put(changePlanFeaturesFilter(state.filter));
        yield put(changePlanFeaturesWidth(state.paneWidth));
        yield put(togglePlanFeaturesPane(state.show));
    }
}