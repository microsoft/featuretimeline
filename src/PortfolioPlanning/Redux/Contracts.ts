import { IProject, IWorkItem, ITeam, LoadingStatus } from "../Contracts";
import { PortfolioPlanningMetadata } from "../Models/PortfolioPlanningQueryModels";
import { ExtendedSinglePlanTelemetry } from "../Models/TelemetryModels";
import { UserSettings } from "../Models/UserSettingsDataModels";

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
    isNewPlanExperience: boolean;
    deletePlanDialogHidden: boolean;
    planTelemetry: ExtendedSinglePlanTelemetry;
    userSettings: UserSettings;
}

export interface IPlanDirectoryState {
    directoryLoadingStatus: LoadingStatus;
    exceptionMessage: string;
    selectedPlanId: string;
    newPlanDialogVisible: boolean;
    plans: PortfolioPlanningMetadata[];
    userSettings: UserSettings;
}
