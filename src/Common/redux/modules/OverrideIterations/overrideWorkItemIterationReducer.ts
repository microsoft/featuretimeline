import produce from "immer";
import { RestoreOverrideIterationType, OverriddenIterationActions, SetOverrideIterationType, ClearOverrideIterationType } from './overrideIterationsActions';
import { IOverriddenIterationDuration } from './overriddenIterationContracts';
import { IDictionaryNumberTo } from "../../Contracts/types";

export function savedOverrideIterationsReducer(
    state: IDictionaryNumberTo<IOverriddenIterationDuration>,
    action: OverriddenIterationActions) {
    if (!state) {
        state = {};
    }
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
