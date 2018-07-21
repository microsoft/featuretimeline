import { Reducer } from 'redux';
import produce from "immer";
import { RestoreOverrideIterationType, OverriddenIterationActions, SetOverrideIterationType, ClearOverrideIterationType } from './overrideIterationsActions';
import { IOverriddenIterationDuration } from './overriddenIterationContracts';

const savedOverrideIterationsReducer: Reducer<IDictionaryNumberTo<IOverriddenIterationDuration>> =
    (state: IDictionaryNumberTo<IOverriddenIterationDuration> = {}, action: OverriddenIterationActions) => {
        return produce(state, draft => {
            switch (action.type) {
                case SetOverrideIterationType:
                    draft[action.payload.workItemId] = action.payload.details;
                    break;
                case ClearOverrideIterationType: {
                    delete draft[action.payload.workItemId];
                    break;
                }
                case RestoreOverrideIterationType: {
                    return action.payload.details;
                }
            }
        });
    };

export default savedOverrideIterationsReducer;