import { Reducer } from 'redux';
import { TogglePlanFeaturesPaneType, PlanFeaturesPaneFilterChangedType, PlanFeaturesPaneActions, PlanFeaturesPaneWidthChangedType } from './actions';
import { IPlanFeaturesState } from '../types';
import produce from "immer";

export const getDefaultPlanFeaturesPaneState = (): IPlanFeaturesState => {
    return {
        show: false,
        paneWidth: 300,
        filter: null
    };
}
const reducer: Reducer<IPlanFeaturesState> = (state: IPlanFeaturesState = getDefaultPlanFeaturesPaneState(), action: PlanFeaturesPaneActions) => {
    const {
        type,
        payload
    } = action;

    return produce(state, draft => {
        switch (type) {
            case TogglePlanFeaturesPaneType:
                draft.show = payload as boolean;
                break;
            case PlanFeaturesPaneFilterChangedType:
                draft.filter = payload as string;
                break;
            case PlanFeaturesPaneWidthChangedType:
                draft.paneWidth = payload as number;
                break;
        }
    });
};

export default reducer;