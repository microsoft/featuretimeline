import { call, select } from 'redux-saga/effects';
import { getTeamId } from '../Selectors/CommonSelectors';
import { iterationDisplayOptionsSelector } from '../../../FeatureTimeline/redux/selectors';
import { saveIterationDisplayOptions } from '../modules/IterationDisplayOptions/iterationDisplayOptionsSaga';

export function* saveDisplayOptions(settingsPrefix: string = "") {
    const displayOptions = yield select(iterationDisplayOptionsSelector());
    const teamId = yield call(getTeamId);
    yield call(saveIterationDisplayOptions, teamId, displayOptions, settingsPrefix);
}