import { Reducer } from 'redux';
import { TogglePlanFeaturesPaneType, PlanFeaturesPaneFilterChangedType, PlanFeaturesPaneActions, PlanFeaturesPaneWidthChangedType } from './actions';
import { IPlanFeaturesState } from '..';
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
    const newState = { ...state };
    switch (type) {
        case TogglePlanFeaturesPaneType:
            newState.show = payload as boolean;
            return newState;
        case PlanFeaturesPaneFilterChangedType:
            newState.filter = payload as string;
            return newState;
        case PlanFeaturesPaneWidthChangedType:
            newState.paneWidth = payload as number;
            return newState;
        default:
            return state;
    }
};

export default reducer;