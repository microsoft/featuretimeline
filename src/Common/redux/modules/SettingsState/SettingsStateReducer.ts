import produce from "immer";
import { RestoreSettingsType, ToggleShowWorkitemDetailsType, ChangeProgressTrackingCriteriaType, ChangeShowClosedSinceDaysType, SettingsActions, SelectEpicType } from "./SettingsStateActions";
import { ISettingsState, ProgressTrackingCriteria } from "./SettingsStateContracts";

export const getDefaultSettingsState = (): ISettingsState => {
    return {
        showWorkItemDetails: false,
        progressTrackingCriteria: 0,
        showClosedSinceDays: 0,
        lastEpicSelected: undefined
    };
}
export function settingsStateReducer(state: ISettingsState = getDefaultSettingsState(), action: SettingsActions): ISettingsState {
    const {
        type,
        payload
    } = action;
    if (type === RestoreSettingsType) {
        return payload as ISettingsState;
    }
    return produce(state, draft => {
        switch (type) {
            case ToggleShowWorkitemDetailsType:
                draft.showWorkItemDetails = payload as boolean;
                break;
            case ChangeProgressTrackingCriteriaType:
                draft.progressTrackingCriteria = payload as ProgressTrackingCriteria;
                break;
            case ChangeShowClosedSinceDaysType:
                draft.showClosedSinceDays = payload as number;
                break;
            case ToggleShowWorkitemDetailsType:
                draft.showWorkItemDetails = payload as boolean;
                break;
            case SelectEpicType:
                draft.lastEpicSelected = payload as number;
                break;
        }
    });
}