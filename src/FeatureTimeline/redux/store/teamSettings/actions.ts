import { Action } from "redux";
import { TeamSetting } from "azure-devops-extension-api/Work";

export const TeamSettingReceivedType = "@@teamSetting/TeamSettingReceived";

export interface TeamSettingReceivedAction extends Action {
    type: "@@teamSetting/TeamSettingReceived";
    payload: {
        projectId: string;
        teamId: string;
        teamSetting: TeamSetting;
    }
}

export type TeamSettingActions = TeamSettingReceivedAction;