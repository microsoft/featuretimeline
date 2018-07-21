import { ActionsUnion, createAction } from "../../../../Common/Helpers/ActionHelper";
import { TeamSettingsIteration } from "TFS/Work/Contracts";

export const TeamIterationsReceivedType = "@@teamiterations/TeamIterationsReceived";
export const TeamIterationsActionCreator = {
    teamIterationsReceived: (teamId: string, teamIterations: TeamSettingsIteration[]) =>
        createAction(TeamIterationsReceivedType, {
            teamId,
            teamIterations
        })
}

export type TeamIterationsActions = ActionsUnion<typeof TeamIterationsActionCreator>;