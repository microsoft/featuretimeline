import { takeEvery, takeLatest } from "redux-saga/effects";
import { OverrideIterationEndType, SaveOverrideIterationActionType } from "../../../Common/redux/modules/overrideIterationProgress/overrideIterationProgressActions";
import { launchOverrideWorkItemIteration, launchSaveOverrideIteration } from "../../../Common/redux/sagas/workItemOverrideIterationListner";
import { DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType, ChangeDisplayIterationCountActionType } from "../../../Common/redux/modules/IterationDisplayOptions/IterationDisplayOptionsActions";
import { ToggleShowWorkitemDetailsType, ChangeProgressTrackingCriteriaType, ChangeShowClosedSinceDaysType } from "../../../Common/redux/modules/SettingsState/SettingsStateActions";
import { saveDisplayOptions } from "../../../Common/redux/sagas/displayOptionsSaga";
import { saveSettings } from "../../../Common/redux/modules/SettingsState/SettingsStateSagas";

export function* watchEpicRollupSagaActions() {
    yield takeEvery(OverrideIterationEndType, launchOverrideWorkItemIteration);
    yield takeEvery(SaveOverrideIterationActionType, launchSaveOverrideIteration);    

    yield takeLatest(DisplayAllIterationsActionType, saveDisplayOptions, "EpicRollup");
    yield takeLatest(ShiftDisplayIterationLeftActionType, saveDisplayOptions, "EpicRollup");
    yield takeLatest(ShiftDisplayIterationRightActionType, saveDisplayOptions, "EpicRollup");
    yield takeLatest(ChangeDisplayIterationCountActionType, saveDisplayOptions, "EpicRollup");
    yield takeLatest(ToggleShowWorkitemDetailsType, saveSettings, "EpicRollup");
    yield takeLatest(ChangeProgressTrackingCriteriaType, saveSettings, "EpicRollup");
    yield takeLatest(ChangeShowClosedSinceDaysType, saveSettings, "EpicRollup");
}