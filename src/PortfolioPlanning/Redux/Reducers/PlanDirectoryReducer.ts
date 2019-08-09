import { IPlanDirectoryState } from "../Contracts";
import produce from "immer";
import { PlanDirectoryActions, PlanDirectoryActionTypes } from "../Actions/PlanDirectoryActions";
import { LoadingStatus } from "../../Contracts";
import { caseInsensitiveComparer } from "../../Common/Utilities/String";

export function planDirectoryReducer(state: IPlanDirectoryState, action: PlanDirectoryActions): IPlanDirectoryState {
    return produce(state || getDefaultState(), (draft: IPlanDirectoryState) => {
        switch (action.type) {
            case PlanDirectoryActionTypes.Initialize: {
                const { directoryData } = action.payload;

                draft.directoryLoadingStatus = LoadingStatus.Loaded;
                draft.exceptionMessage = directoryData.exceptionMessage;
                draft.plans = directoryData.entries;
                draft.plans.sort((a, b) => caseInsensitiveComparer(a.name, b.name));

                break;
            }
            case PlanDirectoryActionTypes.CreatePlanSucceeded: {
                const { newPlan } = action.payload;

                draft.plans.push(newPlan);
                draft.plans.sort((a, b) => caseInsensitiveComparer(a.name, b.name));
                draft.newPlanDialogVisible = false;

                break;
            }
            case PlanDirectoryActionTypes.DeletePlan: {
                const { id } = action.payload;

                // Remove the plan from local state
                draft.plans = draft.plans.filter(plan => plan.id !== id);

                // Navigate back to directory page
                draft.selectedPlanId = undefined;

                break;
            }
            case PlanDirectoryActionTypes.UpdateProjectsAndTeamsMetadata: {
                const { planId, projectNames, teamNames } = action.payload;

                const planToUpdate = draft.plans.find(plan => plan.id === planId);

                planToUpdate.projectNames = projectNames;
                planToUpdate.teamNames = teamNames;

                break;
            }
            case PlanDirectoryActionTypes.ToggleSelectedPlanId: {
                const { id } = action.payload;

                draft.selectedPlanId = id;

                break;
            }
            case PlanDirectoryActionTypes.ToggleNewPlanDialogVisible: {
                const { visible } = action.payload;

                draft.newPlanDialogVisible = visible;

                break;
            }
            case PlanDirectoryActionTypes.HandleGeneralException: {
                const { exception } = action.payload;

                draft.exceptionMessage = exception.message;

                break;
            }
            case PlanDirectoryActionTypes.DismissErrorMessageCard: {
                draft.exceptionMessage = "";

                break;
            }
        }
    });
}

export function getDefaultState(): IPlanDirectoryState {
    return {
        directoryLoadingStatus: LoadingStatus.NotLoaded,
        exceptionMessage: "",
        selectedPlanId: undefined,
        plans: [],
        newPlanDialogVisible: false
    };
}
