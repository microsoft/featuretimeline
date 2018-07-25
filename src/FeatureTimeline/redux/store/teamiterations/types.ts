import { TeamSettingsIteration } from "TFS/Work/Contracts";

export interface ITeamSettingsIterationState {
    // project -> team -> Backlog Configuration
    teamSettingsIterations: IDictionaryStringTo<IDictionaryStringTo<TeamSettingsIteration[]>>;
}
