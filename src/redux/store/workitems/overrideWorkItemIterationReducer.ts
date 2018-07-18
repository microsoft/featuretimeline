import { Reducer } from 'redux';
import { IOverriddenIterationDuration } from '../types';
import { SetOverrideIterationType, ClearOverrideIterationType, OverrideIterationActions } from './actions';
import produce from "immer";

const reducer: Reducer<IDictionaryNumberTo<IOverriddenIterationDuration>> =
    (state: IDictionaryNumberTo<IOverriddenIterationDuration> = {}, action: OverrideIterationActions) => {
        return produce(state, draft => {
            switch (action.type) {
                case SetOverrideIterationType:
                    draft[Number(action.payload.workItemId)] = {
                        startIterationId: action.payload.startIterationId,
                        endIterationId: action.payload.endIterationId,
                        user: action.payload.user
                    };
                    break;
                case ClearOverrideIterationType: {
                    delete draft[action.payload]
                }
            }
        });
    };

export default reducer;