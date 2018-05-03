import { Action } from "redux";

export const GenericErrorType = "@@error/GenericError";

export interface GenericErrorAction extends Action {
    type: "@@error/GenericError";
    payload: string;
}

export type ErrorActions = GenericErrorAction;