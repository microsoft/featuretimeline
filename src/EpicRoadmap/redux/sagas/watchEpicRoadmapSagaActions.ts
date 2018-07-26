import { takeEvery, takeLatest } from "redux-saga/effects";
import { OverrideIterationEndType, SaveOverrideIterationActionType } from "../../../Common/redux/modules/overrideIterationProgress/overrideIterationProgressActions";
import { launchOverrideWorkItemIteration, launchSaveOverrideIteration, launchClearOverrideIteration } from "../../../Common/redux/sagas/workItemOverrideIterationListner";
import { DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType, ChangeDisplayIterationCountActionType } from "../../../Common/redux/modules/IterationDisplayOptions/IterationDisplayOptionsActions";
import { ToggleShowWorkitemDetailsType, ChangeProgressTrackingCriteriaType, ChangeShowClosedSinceDaysType } from "../../../Common/redux/modules/SettingsState/SettingsStateActions";
import { saveDisplayOptions } from "../../../Common/redux/sagas/displayOptionsSaga";
import { saveSettings } from "../../../Common/redux/modules/SettingsState/SettingsStateSagas";
import { LaunchWorkItemFormActionType } from "../../../Common/redux/actions/launchWorkItemForm";
import { launchWorkItemFormSaga } from "./launchWorkItemFromSaga";
import { ClearOverrideIterationType } from "../../../Common/redux/modules/OverrideIterations/overrideIterationsActions";
import { StartUpdateWorkitemIterationActionType } from "../../../Common/redux/actions/StartUpdateWorkitemIterationAction";
import { updateWorkItemIteration } from "../../../Common/redux/sagas/updateWorkItemIterationListner";

export function* watchEpicRoadmapSagaActions() {
    yield takeEvery(ClearOverrideIterationType, launchClearOverrideIteration);
    yield takeEvery(OverrideIterationEndType, launchOverrideWorkItemIteration);
    yield takeEvery(SaveOverrideIterationActionType, launchSaveOverrideIteration);   
    yield takeEvery(LaunchWorkItemFormActionType, launchWorkItemFormSaga); 
    yield takeEvery(StartUpdateWorkitemIterationActionType, updateWorkItemIteration);

    yield takeLatest(DisplayAllIterationsActionType, saveDisplayOptions, "EpicRoadmap");
    yield takeLatest(ShiftDisplayIterationLeftActionType, saveDisplayOptions, "EpicRoadmap");
    yield takeLatest(ShiftDisplayIterationRightActionType, saveDisplayOptions, "EpicRoadmap");
    yield takeLatest(ChangeDisplayIterationCountActionType, saveDisplayOptions, "EpicRoadmap");
    yield takeLatest(ToggleShowWorkitemDetailsType, saveSettings, "EpicRoadmap");
    yield takeLatest(ChangeProgressTrackingCriteriaType, saveSettings, "EpicRoadmap");
    yield takeLatest(ChangeShowClosedSinceDaysType, saveSettings, "EpicRoadmap");
}