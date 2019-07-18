export enum ProgressTrackingCriteria {
    ChildWorkItems,
    EffortsField
}

export interface ISettingsState {
    showWorkItemDetails: boolean;
    progressTrackingCriteria: ProgressTrackingCriteria;
    showClosedSinceDays: number;
    lastEpicSelected?: number;
    dismissedPortfolioPlansBanner: boolean;
}

export interface ISettingsAwareState {
    settingsState: ISettingsState;
}