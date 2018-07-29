import { Action } from "redux";
export const ResetType = "@@common/reset";
export const InitializeType = "@@common/initialize";
export const TogglePlanFeaturesPaneType = "@@common/toggleplanfeaturespane";
export const PlanFeaturesPaneWidthChangedType = "@@common/planfeaturespanewidthchanged";
export const PlanFeaturesPaneFilterChangedType = "@@common/planfeaturespanefilterchanged";
export const ToggleFeatureStateType = "@@common/togglefeaturestate";


export interface InitializeAction extends Action {
    type: "@@common/initialize";
    payload: {
        projectId: string;
        teamId: string;
        backlogLevelName: string;
    }
}

export interface ResetAction extends Action {
    type: "@@common/reset";
    payload: void;
}


export interface TogglePlanFeaturesPaneAction extends Action {
    type: "@@common/toggleplanfeaturespane";
    payload: boolean;
}

export interface PlanFeaturesPaneWidthChangedAction extends Action {
    type: "@@common/planfeaturespanewidthchanged";
    payload: number;
}

export interface PlanFeaturesPaneFilterChangedAction extends Action {
    type: "@@common/planfeaturespanefilterchanged";
    payload: string;
}

export interface ToggleFeatureStateAction extends Action {
    type: "@@common/togglefeaturestate",
    payload: {
        featureName: string;
        isEnabled: boolean
    }
}

export type CommonActions = ToggleFeatureStateAction | ResetAction | InitializeAction;
export type PlanFeaturesPaneActions = TogglePlanFeaturesPaneAction
    | PlanFeaturesPaneFilterChangedAction | PlanFeaturesPaneWidthChangedAction;
