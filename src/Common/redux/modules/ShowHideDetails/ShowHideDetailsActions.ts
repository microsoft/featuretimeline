import { Action } from "redux";
import { ActionCreator } from "react-redux";

export const ShowDetailsType = "@@common/showdetails";
export const CloseDetailsType = "@@common/closedetails";

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


export const showDetails: ActionCreator<ShowDetailsAction> =
    (id: number) => ({
        type: ShowDetailsType,
        payload: { id }
    });


export const closeDetails: ActionCreator<CloseDetailsAction> =
    (id: number) => ({
        type: CloseDetailsType,
        payload: { id }
    });

    export type ShowHideDetailsActions = ShowDetailsAction | CloseDetailsAction;