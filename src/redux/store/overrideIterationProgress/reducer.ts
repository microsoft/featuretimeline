import { Reducer } from 'redux';
import { OverrideIterationActions, OverrideIterationHoverOverIterationType, OverrideIterationStartType, OverrideIterationCleanupType } from './actions';
import { IWorkItemOverrideIteration } from '..';
const reducer: Reducer<IWorkItemOverrideIteration> = (state: IWorkItemOverrideIteration = null, action: OverrideIterationActions) => {
    switch (action.type) {
        case OverrideIterationStartType:
            return { ...action.payload };
        case OverrideIterationCleanupType:
            return null;
        case OverrideIterationHoverOverIterationType: {
            if (!state) {
                return state;
            }
            const newState = { ...state };
            newState.iterationDuration = { ...state.iterationDuration }
            if (newState.changingStart) {
                newState.iterationDuration.startIterationId = action.payload;
            } else {
                newState.iterationDuration.endIterationId = action.payload;
            }

            return newState;
        }       
        default:
            return state;
    }
};

export default reducer;