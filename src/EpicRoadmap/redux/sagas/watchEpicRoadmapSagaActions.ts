import { takeEvery, takeLatest } from "redux-saga/effects";
import { OverrideIterationEndType, SaveOverrideIterationActionType } from "../../../Common/redux/modules/overrideIterationProgress/overrideIterationProgressActions";
import { launchOverrideWorkItemIteration, launchSaveOverrideIteration } from "../../../Common/redux/sagas/workItemOverrideIterationListner";
import { DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType, ChangeDisplayIterationCountActionType } from "../../../Common/redux/modules/IterationDisplayOptions/IterationDisplayOptionsActions";
import { ToggleShowWorkitemDetailsType, ChangeProgressTrackingCriteriaType, ChangeShowClosedSinceDaysType } from "../../../Common/redux/modules/SettingsState/SettingsStateActions";
import { saveDisplayOptions } from "../../../Common/redux/sagas/displayOptionsSaga";
import { saveSettings } from "../../../Common/redux/modules/SettingsState/SettingsStateSagas";

export function* watchEpicRoadmapSagaActions() {
    yield takeEvery(OverrideIterationEndType, launchOverrideWorkItemIteration);
    yield takeEvery(SaveOverrideIterationActionType, launchSaveOverrideIteration);    

    yield takeLatest(DisplayAllIterationsActionType, saveDisplayOptions, "EpicRoadmap");
    yield takeLatest(ShiftDisplayIterationLeftActionType, saveDisplayOptions, "EpicRoadmap");
    yield takeLatest(ShiftDisplayIterationRightActionType, saveDisplayOptions, "EpicRoadmap");
    yield takeLatest(ChangeDisplayIterationCountActionType, saveDisplayOptions, "EpicRoadmap");
    yield takeLatest(ToggleShowWorkitemDetailsType, saveSettings, "EpicRoadmap");
    yield takeLatest(ChangeProgressTrackingCriteriaType, saveSettings, "EpicRoadmap");
    yield takeLatest(ChangeShowClosedSinceDaysType, saveSettings, "EpicRoadmap");
}