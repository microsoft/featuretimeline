import { Reducer } from 'redux';
import { IOverriddenIterationDuration } from '..';
import { SetOverrideIterationType, ClearOverrideIterationType, OverrideIterationActions } from './actions';

const reducer: Reducer<IDictionaryNumberTo<IOverriddenIterationDuration>> =
    (state: IDictionaryNumberTo<IOverriddenIterationDuration> = {}, action: OverrideIterationActions) => {
        switch (action.type) {
            case SetOverrideIterationType:
                const newState = { ...state };
                newState[Number(action.payload.workItemId)] = {
                    startIterationId: action.payload.startIterationId,
                    endIterationId: action.payload.endIterationId,
                    user: action.payload.user
                };
                return newState;
            case ClearOverrideIterationType: {
                if (!state) {
                    return state;
                }
                const newState = { ...state };                
                delete newState[action.payload]
                return newState;
            }
            default:
                return state;
        }
    };

export default reducer;