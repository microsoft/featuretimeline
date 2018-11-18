import { ActionsUnion, createAction } from "../../../../Common/redux/Helpers/ActionHelper";
import { TeamSettingsIteration } from "azure-devops-extension-api/Work";

export const TeamIterationsReceivedType = "@@teamiterations/TeamIterationsReceived";
export const TeamIterationsActionCreator = {
    teamIterationsReceived: (teamId: string, teamIterations: TeamSettingsIteration[]) =>
        createAction(TeamIterationsReceivedType, {
            teamId,
            teamIterations
        })
}

export type TeamIterationsActions = ActionsUnion<typeof TeamIterationsActionCreator>;