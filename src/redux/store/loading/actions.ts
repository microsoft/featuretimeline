import { Action } from "redux";

export const LoadingType = "@@loading/loading";

export interface LoadingAction extends Action {
    type: "@@loading/loading";
    payload: boolean;
}

export type LoadingActions = LoadingAction;