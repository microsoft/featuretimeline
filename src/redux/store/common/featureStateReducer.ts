import { Reducer } from 'redux';
import { ToggleFeatureStateAction, ToggleFeatureStateType } from './actions';
const reducer: Reducer<IDictionaryStringTo<boolean>> = (state: IDictionaryStringTo<boolean> = {}, action: ToggleFeatureStateAction) => {
    switch (action.type) {
        case ToggleFeatureStateType:
            const newState = {...state};
            newState[action.payload.featureName] = action.payload.isEnabled
            return newState;
        default:
            return state;
    }
};

export default reducer;