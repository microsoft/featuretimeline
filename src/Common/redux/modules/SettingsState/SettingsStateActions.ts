import { Action } from "redux";
import { ProgressTrackingCriteria, ISettingsState } from "./SettingsStateContracts";
import { ActionCreator } from "react-redux";

export const ToggleShowWorkitemDetailsType = "@@common/toggleshowworkitemdetails";
export const ChangeProgressTrackingCriteriaType = "@@common/changeprogresstrackingcriteria";
export const ChangeShowClosedSinceDaysType = "@@common/changeshowclosedsincedays";
export const RestoreSettingsType = "@@common/restoresettings";
export const SelectEpicType = "@@common/selectepic";

export interface ToggleShowWorkItemDetailsAction extends Action {
    type: "@@common/toggleshowworkitemdetails",
    payload: boolean;
}

export interface ChangeProgressTrackingCriteriaAction extends Action {
    type: "@@common/changeprogresstrackingcriteria",
    payload: ProgressTrackingCriteria;
}

export interface ChangeShowClosedSinceDaysAction extends Action {
    type: "@@common/changeshowclosedsincedays",
    payload: number;
}

export interface RestoreSettingsAction extends Action {
    type: "@@common/restoresettings",
    payload: ISettingsState;
}
export interface SelectEpicAction extends Action {
    type: "@@common/selectepic",
    payload: number;
}

export type SettingsActions = ToggleShowWorkItemDetailsAction | ChangeProgressTrackingCriteriaAction
    | RestoreSettingsAction | ChangeShowClosedSinceDaysAction | SelectEpicAction;

export const toggleShowWorkItemDetails: ActionCreator<ToggleShowWorkItemDetailsAction> = (show: boolean) => ({
    type: ToggleShowWorkitemDetailsType,
    payload: show
});

export const selectEpic: ActionCreator<SelectEpicAction> = (epicId: number) => ({
    type: SelectEpicType,
    payload: epicId
});


export const changeProgressTrackingCriteria: ActionCreator<ChangeProgressTrackingCriteriaAction> = (criteria: ProgressTrackingCriteria) => ({
    type: ChangeProgressTrackingCriteriaType,
    payload: criteria
});

export const changeShowClosedSinceDays: ActionCreator<ChangeShowClosedSinceDaysAction> = (days: number) => ({
    type: ChangeShowClosedSinceDaysType,
    payload: days
});

export const restoreSettingsState: ActionCreator<RestoreSettingsAction> = (state: ISettingsState) => ({
    type: RestoreSettingsType,
    payload: state
});
