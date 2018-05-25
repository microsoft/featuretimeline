import { Reducer } from 'redux';
import { ISettingsState, ProgressTrackingCriteria } from '../types';
import { SettingsActions, ToggleShowWorkitemDetailsType, ChangeProgressTrackingCriteriaType } from './actions';


export const getDefaultSettingsState = (): ISettingsState => {
    return {
        showWorkItemDetails: false,
        progressTrackingCriteria: 0
    };
}
const reducer: Reducer<ISettingsState> = (state: ISettingsState = getDefaultSettingsState(), action: SettingsActions) => {
    const {
        type,
        payload
    } = action;
    const newState = { ...state };
    switch (type) {
        case ToggleShowWorkitemDetailsType:
            newState.showWorkItemDetails = payload as boolean;
            return newState;
        case ChangeProgressTrackingCriteriaType:
            newState.progressTrackingCriteria = payload as ProgressTrackingCriteria;
            return newState;
        default:
            return state;
    }
};

export default reducer;