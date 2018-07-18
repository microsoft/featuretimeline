import { Reducer } from 'redux';
import { ToggleFeatureStateAction, ToggleFeatureStateType } from './actions';
import produce from "immer";

const reducer: Reducer<IDictionaryStringTo<boolean>> = (state: IDictionaryStringTo<boolean> = {}, action: ToggleFeatureStateAction) => {
    return produce(state, draft => {
        switch (action.type) {
            case ToggleFeatureStateType:
                draft[action.payload.featureName] = action.payload.isEnabled
        }
    });
};

export default reducer;