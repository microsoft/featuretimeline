import { IPortfolioPlanningState, IPlanDirectoryState } from "../Contracts";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { PortfolioPlanningMetadata } from "../../Models/PortfolioPlanningQueryModels";
import { SinglePlanTelemetry } from "../../Models/TelemetryModels";

export function getSelectedPlanId(state: IPortfolioPlanningState): string {
    return state.planDirectoryState.selectedPlanId;
}

export function getSelectedPlanMetadata(state: IPortfolioPlanningState): PortfolioPlanningMetadata {
    return state.planDirectoryState.plans.find(plan => plan.id === state.planDirectoryState.selectedPlanId);
}

export function getSelectedPlanOwner(state: IPortfolioPlanningState): IdentityRef {
    return state.planDirectoryState.plans.find(plan => plan.id === state.planDirectoryState.selectedPlanId).owner;
}

export function getPlansTelemetry(state: IPlanDirectoryState): SinglePlanTelemetry[] {
    if (!state || !state.plans) {
        return [];
    }

    return state.plans.map(plan => {
        return {
            teams: plan.teamNames ? plan.teamNames.length : 0,
            projects: plan.projectNames ? plan.projectNames.length : 0
        };
    });
}
