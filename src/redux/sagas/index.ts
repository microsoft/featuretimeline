import { takeEvery } from "redux-saga/effects";
import { ClearOverrideIterationType, LaunchWorkItemFormActionType, StartUpdateWorkitemIterationActionType } from "../store/workItems/actions";
import { launchWorkItemFormSaga } from "./launchWorkItemFormSaga";
import { InitializeType } from "../store/common/actions";
import { callinitialize } from "./initialize";
import { launchOverrideWorkItemIteration, launchClearOverrideIteration, launchSaveOverrideIteration } from "./workItemOverrideIterationListner";
import { OverrideIterationEndType, SaveOverrideIterationActionType } from "../store/overrideIterationProgress/actions";
import { updateWorkItemIteration } from "./updateWorkItemIterationListner";

export function* watchSagaActions() {
    yield takeEvery(OverrideIterationEndType, launchOverrideWorkItemIteration);
    yield takeEvery(SaveOverrideIterationActionType, launchSaveOverrideIteration);    
    yield takeEvery(ClearOverrideIterationType, launchClearOverrideIteration);
    yield takeEvery(LaunchWorkItemFormActionType, launchWorkItemFormSaga);
    yield takeEvery(InitializeType, callinitialize);
    yield takeEvery(StartUpdateWorkitemIterationActionType, updateWorkItemIteration);
}
