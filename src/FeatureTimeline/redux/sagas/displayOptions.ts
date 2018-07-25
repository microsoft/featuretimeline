import { call, select } from 'redux-saga/effects';
import { getTeamId } from '../../../Common/Selectors/CommonSelectors';
import { iterationDisplayOptionsSelector } from '../selectors';
import { saveIterationDisplayOptions } from '../../../Common/modules/IterationDisplayOptions/iterationDisplayOptionsSaga';

export function* saveDisplayOptions() {
    const displayOptions = yield select(iterationDisplayOptionsSelector());
    const teamId = yield call(getTeamId);
    yield call(saveIterationDisplayOptions, teamId, displayOptions);
}