import { takeEvery, takeLatest } from "redux-saga/effects";
import { ClearOverrideIterationType, LaunchWorkItemFormActionType, StartUpdateWorkitemIterationActionType } from "../store/workItems/actions";
import { launchWorkItemFormSaga } from "./launchWorkItemFormSaga";
import { InitializeType } from "../store/common/actions";
import { callinitialize } from "./initialize";
import { launchOverrideWorkItemIteration, launchClearOverrideIteration, launchSaveOverrideIteration } from "./workItemOverrideIterationListner";
import { OverrideIterationEndType, SaveOverrideIterationActionType } from "../store/overrideIterationProgress/actions";
import { updateWorkItemIteration } from "./updateWorkItemIterationListner";
import { saveDisplayOptions } from './displayOptions';
import { DisplayAllIterationsActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationRightActionType, ChangeDisplayIterationCountActionType } from "../store/teamiterations/actions";

export function* watchSagaActions() {
    yield takeEvery(OverrideIterationEndType, launchOverrideWorkItemIteration);
    yield takeEvery(SaveOverrideIterationActionType, launchSaveOverrideIteration);
    yield takeEvery(ClearOverrideIterationType, launchClearOverrideIteration);
    yield takeEvery(LaunchWorkItemFormActionType, launchWorkItemFormSaga);
    yield takeEvery(InitializeType, callinitialize);
    yield takeEvery(StartUpdateWorkitemIterationActionType, updateWorkItemIteration);

    yield takeLatest(DisplayAllIterationsActionType, saveDisplayOptions);
    yield takeLatest(ShiftDisplayIterationLeftActionType, saveDisplayOptions);
    yield takeLatest(ShiftDisplayIterationRightActionType, saveDisplayOptions);
    yield takeLatest(ChangeDisplayIterationCountActionType, saveDisplayOptions);
}
