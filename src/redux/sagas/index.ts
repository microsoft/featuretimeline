import { takeEvery, takeLatest } from "redux-saga/effects";
import { ClearOverrideIterationType, LaunchWorkItemFormActionType, StartUpdateWorkitemIterationActionType, StartMarkInProgressActionType } from "../store/workitems/actions";
import { launchWorkItemFormSaga } from "./launchWorkItemFormSaga";
import { InitializeType, ToggleProposedWorkItemsPaneType } from "../store/common/actions";
import { callInitialize } from "./initialize";
import { launchOverrideWorkItemIteration, launchClearOverrideIteration, launchSaveOverrideIteration } from "./workItemOverrideIterationListner";
import { OverrideIterationEndType, SaveOverrideIterationActionType } from "../store/overrideIterationProgress/actions";
import { updateWorkItemIteration } from "./updateWorkItemIterationListner";
import { saveDisplayOptions } from './displayOptions';
import { DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType, ChangeDisplayIterationCountActionType } from "../store/teamiterations/actions";
import { markWorkItemInProgressListner } from "./markWorkItemInProgressListner";
import { savePlanFeatures } from "./planFeaturesOptions";

export function* watchSagaActions() {
    yield takeEvery(OverrideIterationEndType, launchOverrideWorkItemIteration);
    yield takeEvery(SaveOverrideIterationActionType, launchSaveOverrideIteration);
    yield takeEvery(ClearOverrideIterationType, launchClearOverrideIteration);
    yield takeEvery(LaunchWorkItemFormActionType, launchWorkItemFormSaga);
    yield takeEvery(InitializeType, callInitialize);
    yield takeEvery(StartUpdateWorkitemIterationActionType, updateWorkItemIteration);
    yield takeEvery(StartMarkInProgressActionType, markWorkItemInProgressListner);

    yield takeLatest(DisplayAllIterationsActionType, saveDisplayOptions);
    yield takeLatest(ShiftDisplayIterationLeftActionType, saveDisplayOptions);
    yield takeLatest(ShiftDisplayIterationRightActionType, saveDisplayOptions);
    yield takeLatest(ChangeDisplayIterationCountActionType, saveDisplayOptions);

    yield takeLatest(ToggleProposedWorkItemsPaneType, savePlanFeatures);
}
