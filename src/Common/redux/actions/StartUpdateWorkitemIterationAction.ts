import { Action } from "redux";
import { TeamSettingsIteration } from "azure-devops-extension-api/Work";
import { ActionCreator } from 'redux';

export const StartUpdateWorkitemIterationActionType = "@@workitems/StartUpdateWorkitemIterationAction";
export interface StartUpdateWorkitemIterationAction extends Action {
    type: "@@workitems/StartUpdateWorkitemIterationAction";
    payload: {
        workItem: number;
        teamIteration: TeamSettingsIteration;
        override: boolean;
    };
}

export const startUpdateWorkItemIteration: ActionCreator<StartUpdateWorkitemIterationAction> = (workItem: number, teamIteration: TeamSettingsIteration, override: boolean) => ({
    type: StartUpdateWorkitemIterationActionType,
    payload: {
        workItem,
        teamIteration,
        override
    }
});