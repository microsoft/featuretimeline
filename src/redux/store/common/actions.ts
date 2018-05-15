import { Action } from "redux";

export const ResetType = "@@common/reset";
export const InitializeType = "@@common/initialize";
export const ShowDetailsType = "@@common/showdetails";
export const CloseDetailsType = "@@common/closedetails";
export const ToggleProposedWorkItemsPaneType = "@@common/toggleproposedworkitemspane";
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

export interface ToggleProposedWorkItemsPaneAction extends Action {
    type: "@@common/toggleproposedworkitemspane";
    payload: boolean;
}

export interface ToggleFeatureStateAction extends Action {
    type: "@@common/togglefeaturestate",
    payload: {
        featureName: string;
        isEnabled: boolean
    }
}

export type CommonActions = ToggleFeatureStateAction | ResetAction | InitializeAction | ShowDetailsAction | CloseDetailsAction | ToggleProposedWorkItemsPaneAction;