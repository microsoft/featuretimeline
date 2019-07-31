import { IProject, IWorkItem, ProgressTrackingCriteria, ITeam, LoadingStatus } from "../Contracts";
import { PortfolioPlanningMetadata } from "../Models/PortfolioPlanningQueryModels";
import { ExtendedSinglePlanTelemetry } from "../Models/TelemetryModels";

export interface IPortfolioPlanningState {
    planDirectoryState: IPlanDirectoryState;
    epicTimelineState: IEpicTimelineState;
}

export interface IEpicTimelineState {
    planLoadingStatus: LoadingStatus;
    exceptionMessage: string;
    projects: IProject[];
    teams: { [teamId: string]: ITeam };
    epics: IWorkItem[];
    message: string;
    addItemsPanelOpen: boolean;
    setDatesDialogHidden: boolean;
    planSettingsPanelOpen: boolean;
    selectedItemId: number;
    progressTrackingCriteria: ProgressTrackingCriteria;
    isNewPlanExperience: boolean;
    deletePlanDialogHidden: boolean;
    planTelemetry: ExtendedSinglePlanTelemetry;
}

export interface IPlanDirectoryState {
    directoryLoadingStatus: LoadingStatus;
    exceptionMessage: string;
    selectedPlanId: string;
    newPlanDialogVisible: boolean;
    plans: PortfolioPlanningMetadata[];
}
