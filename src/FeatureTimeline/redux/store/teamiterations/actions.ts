import { Action } from "redux";
import { TeamSettingsIteration } from "azure-devops-extension-api/Work";
import { DisplayAllIterationsAction, ChangeDisplayIterationCountAction, ShiftDisplayIterationLeftAction, 
    ShiftDisplayIterationRightAction, RestoreDisplayIterationCountAction } from "../../../../Common/redux/modules/IterationDisplayOptions/IterationDisplayOptionsActions";

export const TeamSettingsIterationReceivedType = "@@TeamSettingsIteration/TeamSettingsIterationReceived";

export interface TeamSettingsIterationReceivedAction extends Action {
    type: "@@TeamSettingsIteration/TeamSettingsIterationReceived";
    payload: {
        projectId: string;
        teamId: string;
        TeamSettingsIterations: TeamSettingsIteration[];
    }
}


export type TeamSettingsIterationActions = TeamSettingsIterationReceivedAction | DisplayAllIterationsAction | ChangeDisplayIterationCountAction | ShiftDisplayIterationLeftAction | ShiftDisplayIterationRightAction | RestoreDisplayIterationCountAction;