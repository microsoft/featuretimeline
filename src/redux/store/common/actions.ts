import { Action } from "redux";

export const ResetType = "@@common/reset";
export const InitializeType = "@@common/initialize";
export const ShowDetailsType = "@@common/showdetails";
export const CloseDetailsType = "@@common/closedetails";
export const ToggleProposedWorkItemsPaneType = "@@common/toggleproposedworkitemspane";

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
    payload: void;
}

export type CommonActions = ResetAction | InitializeAction | ShowDetailsAction | CloseDetailsAction | ToggleProposedWorkItemsPaneAction;