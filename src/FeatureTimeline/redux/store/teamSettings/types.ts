import { TeamSetting } from "TFS/Work/Contracts";

export interface ITeamSettingState {
    // project -> team -> TeamSetting
    teamSetting: IDictionaryStringTo<IDictionaryStringTo<TeamSetting>>;
}