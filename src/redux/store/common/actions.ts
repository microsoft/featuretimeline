import { Action } from "redux";

export const ResetType = "@@common/reset";
export const InitializeType = "@@common/initialize";
export const ShowDetailsType = "@@common/showdetails";
export const CloseDetailsType = "@@common/closedetails";
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


export interface ShowDetailsAction extends Action {
    type: "@@common/showdetails";
    payload: {
        id: number;
    }
}


export interface CloseDetailsAction extends Action {
    type: "@@common/closedetails";
    payload: {
        id: number;
    }
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

export type CommonActions = ToggleFeatureStateAction | ResetAction | InitializeAction
    | ShowDetailsAction | CloseDetailsAction;
export type PlanFeaturesPaneActions = TogglePlanFeaturesPaneAction
    | PlanFeaturesPaneFilterChangedAction | PlanFeaturesPaneWidthChangedAction;