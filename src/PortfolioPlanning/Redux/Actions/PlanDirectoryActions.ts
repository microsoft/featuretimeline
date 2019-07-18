import { createAction, ActionsUnion } from "../Helpers";
import { PortfolioPlanningDirectory, PortfolioPlanning } from "../../Models/PortfolioPlanningQueryModels";
import { PortfolioTelemetry } from "../../Common/Utilities/Telemetry";

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
    createPlan: (name: string, description: string) => {
        PortfolioTelemetry.getInstance().TrackAction(PlanDirectoryActionTypes.CreatePlan);
        return createAction(PlanDirectoryActionTypes.CreatePlan, {
            name,
            description
        });
    },
    createPlanSucceeded: (newPlan: PortfolioPlanning) => {
        PortfolioTelemetry.getInstance().TrackAction(PlanDirectoryActionTypes.CreatePlanSucceeded);
        return createAction(PlanDirectoryActionTypes.CreatePlanSucceeded, {
            newPlan
        });
    },
    createPlanFailed: (message: string) => {
        PortfolioTelemetry.getInstance().TrackAction(PlanDirectoryActionTypes.CreatePlanFailed, {
            ["message"]: message
        });
        return createAction(PlanDirectoryActionTypes.CreatePlanFailed, {
            message
        });
    },
    deletePlan: (id: string) => {
        PortfolioTelemetry.getInstance().TrackAction(PlanDirectoryActionTypes.DeletePlan);
        return createAction(PlanDirectoryActionTypes.DeletePlan, { id });
    },
    updateProjectsAndTeamsMetadata: (projectNames: string[], teamNames: string[]) =>
        createAction(PlanDirectoryActionTypes.UpdateProjectsAndTeamsMetadata, { projectNames, teamNames }),
    toggleSelectedPlanId: (id: string) => {
        PortfolioTelemetry.getInstance().TrackAction(PlanDirectoryActionTypes.ToggleSelectedPlanId);
        return createAction(PlanDirectoryActionTypes.ToggleSelectedPlanId, {
            id
        });
    },
    toggleNewPlanDialogVisible: (visible: boolean) => {
        PortfolioTelemetry.getInstance().TrackAction(PlanDirectoryActionTypes.ToggleNewPlanDialogVisible, {
            ["visible"]: visible
        });
        return createAction(PlanDirectoryActionTypes.ToggleNewPlanDialogVisible, {
            visible
        });
    },
    handleGeneralException: (exception: Error) => {
        PortfolioTelemetry.getInstance().TrackException(exception);
        return createAction(PlanDirectoryActionTypes.HandleGeneralException, { exception });
    },
    dismissErrorMessageCard: () => createAction(PlanDirectoryActionTypes.DismissErrorMessageCard)
};

export type PlanDirectoryActions = ActionsUnion<typeof PlanDirectoryActions>;
