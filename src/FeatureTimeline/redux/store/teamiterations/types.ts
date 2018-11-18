import { TeamSettingsIteration } from "azure-devops-extension-api/Work";
import { IDictionaryStringTo } from "../../../../Common/redux/Contracts/types";

export interface ITeamSettingsIterationState {
    // project -> team -> Backlog Configuration
    teamSettingsIterations: IDictionaryStringTo<IDictionaryStringTo<TeamSettingsIteration[]>>;
}
