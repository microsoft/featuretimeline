import { Reducer } from 'redux';
import { OverrideIterationActions, OverrideIterationHoverOverIterationType, OverrideIterationStartType, OverrideIterationCleanupType } from './actions';
import produce from "immer";
import { IWorkItemOverrideIteration } from '../OverrideIterations/overriddenIterationContracts';

export const overrideIterationProgressReducer: Reducer<IWorkItemOverrideIteration> = (state: IWorkItemOverrideIteration = null, action: OverrideIterationActions) => {

    return produce(state, draft => {
        switch (action.type) {
            case OverrideIterationStartType:
                return { ...action.payload };
            case OverrideIterationCleanupType:
                return null;
            case OverrideIterationHoverOverIterationType: {
                if (!state) {
                    return state;
                }
                draft.iterationDuration = { ...state.iterationDuration }
                if (state.changingStart) {
                    draft.iterationDuration.startIterationId = action.payload;
                } else {
                    draft.iterationDuration.endIterationId = action.payload;
                }
            }
        }
    });
};
