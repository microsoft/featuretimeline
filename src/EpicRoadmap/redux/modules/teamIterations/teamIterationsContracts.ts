import { TeamSettingsIteration } from 'TFS/Work/Contracts';

export type TeamIterationsMap = { [teamId: string]: TeamSettingsIteration[] }

export interface ITeamIterationsAwareState {
    teamIterations: TeamIterationsMap;
}