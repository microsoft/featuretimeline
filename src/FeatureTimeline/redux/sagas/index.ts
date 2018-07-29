import { takeEvery, takeLatest } from "redux-saga/effects";
import { StartMarkInProgressActionType } from "../store/workitems/actions";
import { StartUpdateWorkitemIterationActionType } from "../../../Common/redux/actions/StartUpdateWorkitemIterationAction";
import { launchWorkItemFormSaga } from "./launchWorkItemFormSaga";
import { InitializeType, TogglePlanFeaturesPaneType, PlanFeaturesPaneFilterChangedType, PlanFeaturesPaneWidthChangedType,
     } from "../store/common/actions";
import { callInitialize } from "./initializeFeatureTimeline";
import { launchOverrideWorkItemIteration, launchClearOverrideIteration, launchSaveOverrideIteration } from "../../../Common/redux/sagas/workItemOverrideIterationListner";
import { updateWorkItemIteration } from "../../../Common/redux/sagas/updateWorkItemIterationListner";
import { saveDisplayOptions } from '../../../Common/redux/sagas/displayOptionsSaga';
import { markWorkItemInProgressListner } from "./markWorkItemInProgressListner";
import { savePlanFeaturesDisplayOptions, restorePlanFeaturesDisplayOptions } from "./planFeaturesDisplayOptions";
import { initializeFeatureState } from "./featureStateReader";
import { saveSettings } from "../../../Common/redux/modules/SettingsState/SettingsStateSagas";
import { ClearOverrideIterationType } from '../../../Common/redux/modules/OverrideIterations/overrideIterationsActions';
import { LaunchWorkItemFormActionType } from "../../../Common/redux/actions/launchWorkItemForm";
import { OverrideIterationEndType, SaveOverrideIterationActionType } from "../../../Common/redux/modules/overrideIterationProgress/overrideIterationProgressActions";
import { DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType, ChangeDisplayIterationCountActionType } from "../../../Common/redux/modules/IterationDisplayOptions/IterationDisplayOptionsActions";
import { ToggleShowWorkitemDetailsType, ChangeProgressTrackingCriteriaType, ChangeShowClosedSinceDaysType } from "../../../Common/redux/modules/SettingsState/SettingsStateActions";

export function* watchSagaActions() {
    yield takeEvery(ClearOverrideIterationType, launchClearOverrideIteration);
    yield takeEvery(LaunchWorkItemFormActionType, launchWorkItemFormSaga);
    yield takeEvery(InitializeType, callInitialize);
    yield takeEvery(InitializeType, initializeFeatureState);
    yield takeEvery(StartUpdateWorkitemIterationActionType, updateWorkItemIteration);
    yield takeEvery(StartMarkInProgressActionType, markWorkItemInProgressListner);

    yield takeEvery(OverrideIterationEndType, launchOverrideWorkItemIteration);
    yield takeEvery(SaveOverrideIterationActionType, launchSaveOverrideIteration);


    yield takeLatest(DisplayAllIterationsActionType, saveDisplayOptions, "");
    yield takeLatest(ShiftDisplayIterationLeftActionType, saveDisplayOptions, "");
    yield takeLatest(ShiftDisplayIterationRightActionType, saveDisplayOptions, "");
    yield takeLatest(ChangeDisplayIterationCountActionType, saveDisplayOptions, "");
    yield takeLatest(ToggleShowWorkitemDetailsType, saveSettings, "");
    yield takeLatest(ChangeProgressTrackingCriteriaType, saveSettings, "");
    yield takeLatest(ChangeShowClosedSinceDaysType, saveSettings, "");

    yield takeLatest(TogglePlanFeaturesPaneType, savePlanFeaturesDisplayOptions);
    yield takeLatest(PlanFeaturesPaneFilterChangedType, savePlanFeaturesDisplayOptions);
    yield takeLatest(PlanFeaturesPaneWidthChangedType, savePlanFeaturesDisplayOptions);

    yield takeLatest(InitializeType, restorePlanFeaturesDisplayOptions);
}
