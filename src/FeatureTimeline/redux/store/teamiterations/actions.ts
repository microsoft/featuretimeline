import { Action } from "redux";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { DisplayAllIterationsAction, ChangeDisplayIterationCountAction, ShiftDisplayIterationLeftAction, ShiftDisplayIterationRightAction, RestoreDisplayIterationCountAction } from "../../../../Common/modules/IterationDisplayOptions/IterationDisplayOptionsActions";

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