import { TeamSetting } from "azure-devops-extension-api/Work";
import { IDictionaryStringTo } from "../../../../Common/redux/Contracts/types";

export interface ITeamSettingState {
    // project -> team -> TeamSetting
    teamSetting: IDictionaryStringTo<IDictionaryStringTo<TeamSetting>>;
}