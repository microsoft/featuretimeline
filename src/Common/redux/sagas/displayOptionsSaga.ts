import { call, select } from 'redux-saga/effects';
import { getTeamId } from '../Selectors/CommonSelectors';
import { saveIterationDisplayOptions } from '../modules/IterationDisplayOptions/iterationDisplayOptionsSaga';
import { getIterationDisplayOptionsState } from '../modules/IterationDisplayOptions/iterationDisplayOptionsSelector';

export function* saveDisplayOptions(settingsPrefix: string = "") {
    debugger;
    const displayOptions = yield select(getIterationDisplayOptionsState);
    const teamId = yield call(getTeamId);
    yield call(saveIterationDisplayOptions, teamId, displayOptions, settingsPrefix);
}