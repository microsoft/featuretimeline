import { createAction, ActionsUnion } from "../Helpers";
import { PortfolioPlanningDirectory, PortfolioPlanning } from "../../Models/PortfolioPlanningQueryModels";

export const enum PlanDirectoryActionTypes {
    Initialize = "PlanDirectory/Initialize",
    CreatePlan = "PlanDirectory/CreatePlan",
    CreatePlanSucceeded = "PlanDirectory/CreatePlanSucceeded",
    CreatePlanFailed = "PlanDirectory/CreatePlanFailed",
    DeletePlan = "PlanDirectory/DeletePlan",
    UpdateProjectsAndTeamsMetadata = "PlanDirectory/UpdateProjectsAndTeamsMetadata",
    ToggleSelectedPlanId = "PlanDirectory/SelectPlan",
    ToggleNewPlanDialogVisible = "PlanDirectory/ToggleNewPlanDialogVisible",
    HandleGeneralException = "PlanDirectory/HandleGeneralException",
    DismissErrorMessageCard = "PlanDirectory/DismissErrorMessageCard"
}

export const PlanDirectoryActions = {
    initialize: (directoryData: PortfolioPlanningDirectory) =>
        createAction(PlanDirectoryActionTypes.Initialize, { directoryData }),
    createPlan: (name: string, description: string) =>
        createAction(PlanDirectoryActionTypes.CreatePlan, {
            name,
            description
        }),
    createPlanSucceeded: (newPlan: PortfolioPlanning) =>
        createAction(PlanDirectoryActionTypes.CreatePlanSucceeded, {
            newPlan
        }),
    createPlanFailed: (message: string) =>
        createAction(PlanDirectoryActionTypes.CreatePlanFailed, {
            message
        }),
    deletePlan: (id: string) => createAction(PlanDirectoryActionTypes.DeletePlan, { id }),
    updateProjectsAndTeamsMetadata: (projectNames: string[], teamNames: string[]) =>
        createAction(PlanDirectoryActionTypes.UpdateProjectsAndTeamsMetadata, { projectNames, teamNames }),
    toggleSelectedPlanId: (id: string) =>
        createAction(PlanDirectoryActionTypes.ToggleSelectedPlanId, {
            id
        }),
    toggleNewPlanDialogVisible: (visible: boolean) =>
        createAction(PlanDirectoryActionTypes.ToggleNewPlanDialogVisible, {
            visible
        }),
    handleGeneralException: exception => createAction(PlanDirectoryActionTypes.HandleGeneralException, { exception }),
    dismissErrorMessageCard: () => createAction(PlanDirectoryActionTypes.DismissErrorMessageCard)
};

export type PlanDirectoryActions = ActionsUnion<typeof PlanDirectoryActions>;
