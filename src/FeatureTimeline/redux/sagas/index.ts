import { takeEvery, takeLatest } from "redux-saga/effects";
import { LaunchWorkItemFormActionType, StartUpdateWorkitemIterationActionType, StartMarkInProgressActionType } from "../store/workitems/actions";
import { launchWorkItemFormSaga } from "./launchWorkItemFormSaga";
import { InitializeType, TogglePlanFeaturesPaneType, PlanFeaturesPaneFilterChangedType, PlanFeaturesPaneWidthChangedType, ToggleShowWorkitemDetailsType, ChangeProgressTrackingCriteriaType, ChangeShowClosedSinceDaysType } from "../store/common/actions";
import { callInitialize } from "./initializeFeatureTimeline";
import { launchOverrideWorkItemIteration, launchClearOverrideIteration, launchSaveOverrideIteration } from "../../../Common/sagas/workItemOverrideIterationListner";
import { updateWorkItemIteration } from "../../../Common/sagas/updateWorkItemIterationListner";
import { saveDisplayOptions } from './displayOptions';
import { DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType, ChangeDisplayIterationCountActionType } from "../store/teamiterations/actions";
import { markWorkItemInProgressListner } from "./markWorkItemInProgressListner";
import { savePlanFeaturesDisplayOptions, restorePlanFeaturesDisplayOptions } from "./planFeaturesDisplayOptions";
import { initializeFeatureState } from "./featureStateReader";
import { saveSettings } from "./saveSettings";
import { ClearOverrideIterationType } from '../../../Common/modules/OverrideIterations/overrideIterationsActions';
import { SaveOverrideIterationActionType, OverrideIterationEndType } from "../../../Common/overrideIterationProgress/actions";

export function* watchSagaActions() {
    yield takeEvery(OverrideIterationEndType, launchOverrideWorkItemIteration);
    yield takeEvery(SaveOverrideIterationActionType, launchSaveOverrideIteration);
    yield takeEvery(ClearOverrideIterationType, launchClearOverrideIteration);
    yield takeEvery(LaunchWorkItemFormActionType, launchWorkItemFormSaga);
    yield takeEvery(InitializeType, callInitialize);
    yield takeEvery(InitializeType, initializeFeatureState);
    yield takeEvery(StartUpdateWorkitemIterationActionType, updateWorkItemIteration);
    yield takeEvery(StartMarkInProgressActionType, markWorkItemInProgressListner);

    yield takeLatest(DisplayAllIterationsActionType, saveDisplayOptions);
    yield takeLatest(ShiftDisplayIterationLeftActionType, saveDisplayOptions);
    yield takeLatest(ShiftDisplayIterationRightActionType, saveDisplayOptions);
    yield takeLatest(ChangeDisplayIterationCountActionType, saveDisplayOptions);

    yield takeLatest(TogglePlanFeaturesPaneType, savePlanFeaturesDisplayOptions);
    yield takeLatest(PlanFeaturesPaneFilterChangedType, savePlanFeaturesDisplayOptions);
    yield takeLatest(PlanFeaturesPaneWidthChangedType, savePlanFeaturesDisplayOptions);

    yield takeLatest(ToggleShowWorkitemDetailsType, saveSettings);
    yield takeLatest(ChangeProgressTrackingCriteriaType, saveSettings);
    yield takeLatest(ChangeShowClosedSinceDaysType, saveSettings);

    yield takeLatest(InitializeType, restorePlanFeaturesDisplayOptions);
}
