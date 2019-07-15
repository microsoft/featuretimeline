import { IPortfolioPlanningState } from "../Contracts";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { PortfolioPlanningMetadata } from "../../Models/PortfolioPlanningQueryModels";

export function getSelectedPlanId(state: IPortfolioPlanningState): string {
    return state.planDirectoryState.selectedPlanId;
}

export function getSelectedPlanMetadata(state: IPortfolioPlanningState): PortfolioPlanningMetadata {
    return state.planDirectoryState.plans.find(plan => plan.id === state.planDirectoryState.selectedPlanId);
}

export function getSelectedPlanOwner(state: IPortfolioPlanningState): IdentityRef {
    return state.planDirectoryState.plans.find(plan => plan.id === state.planDirectoryState.selectedPlanId).owner;
}
