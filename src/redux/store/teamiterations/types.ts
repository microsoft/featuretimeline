import { TeamSettingsIteration } from "TFS/Work/Contracts";

export interface IIterationDisplayOptions {
    totalIterations: number
    originalCount: number;
    count: number;
    startIndex: number;
    endIndex: number;
    teamId: string;
    projectId: string;
}

export interface ITeamSettingsIterationState {
    // project -> team -> Backlog Configuration
    teamSettingsIterations: IDictionaryStringTo<IDictionaryStringTo<TeamSettingsIteration[]>>;
    iterationDisplayOptions: IIterationDisplayOptions;
}