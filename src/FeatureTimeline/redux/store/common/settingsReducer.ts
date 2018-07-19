import { Reducer } from 'redux';
import { ISettingsState, ProgressTrackingCriteria } from '../types';
import { SettingsActions, ToggleShowWorkitemDetailsType, ChangeProgressTrackingCriteriaType, RestoreSettingsType, ChangeShowClosedSinceDaysType } from './actions';
import produce from "immer";

export const getDefaultSettingsState = (): ISettingsState => {
    return {
        showWorkItemDetails: false,
        progressTrackingCriteria: 0,
        showClosedSinceDays: 0
    };
}
const reducer: Reducer<ISettingsState> = (state: ISettingsState = getDefaultSettingsState(), action: SettingsActions) => {
    const {
        type,
        payload
    } = action;
    if(type === RestoreSettingsType) {
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
        }
    });
};

export default reducer;