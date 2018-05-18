import { Reducer } from 'redux';
import { ISettingsState } from '..';
import { SettingsActions, ToggleShowWorkitemDetailsType } from './actions';
export const getDefaultSettingsState = (): ISettingsState => {
    return {
        showWorkItemDetails: false
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
        default:
            return state;
    }
};

export default reducer;