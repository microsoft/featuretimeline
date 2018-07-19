import { Action } from "redux";
import { TeamSetting } from "TFS/Work/Contracts";

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