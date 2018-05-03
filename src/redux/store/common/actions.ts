import { Action } from "redux";

export const InitializeType = "@@common/initialize";
export const ShowDetailsType = "@@common/showdetails";
export const CloseDetailsType = "@@common/closedetails";

export interface InitializeAction extends Action {
    type: "@@common/initialize";
    payload: {
        projectId: string;
        teamId: string;
        backlogLevelName: string;
    }
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

export type CommonActions = InitializeAction | ShowDetailsAction | CloseDetailsAction;