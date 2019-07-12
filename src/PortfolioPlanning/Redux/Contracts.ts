import { IProject, IEpic, ProgressTrackingCriteria, ITeam, IProjectConfiguration, LoadingStatus } from "../Contracts";
import { PortfolioPlanningMetadata } from "../Models/PortfolioPlanningQueryModels";

export interface IPortfolioPlanningState {
    planDirectoryState: IPlanDirectoryState;
    epicTimelineState: IEpicTimelineState;
}

export interface IEpicTimelineState {
    planLoadingStatus: LoadingStatus;
    exceptionMessage: string;
    projects: IProject[];
    projectConfiguration: { [projectId: string]: IProjectConfiguration };
    teams: { [teamId: string]: ITeam };
    epics: IEpic[];
    message: string;
    addItemsPanelOpen: boolean;
    setDatesDialogHidden: boolean;
    planSettingsPanelOpen: boolean;
    selectedItemId: number;
    progressTrackingCriteria: ProgressTrackingCriteria;
    visibleTimeStart: number;
    visibleTimeEnd: number;
    isNewPlanExperience: boolean;
    deletePlanDialogHidden: boolean;
}

export interface IPlanDirectoryState {
    directoryLoadingStatus: LoadingStatus;
    exceptionMessage: string;
    selectedPlanId: string;
    newPlanDialogVisible: boolean;
    plans: PortfolioPlanningMetadata[];
}
