import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';

export type TeamIterationsMap = { [teamId: string]: TeamSettingsIteration[] }

export interface ITeamIterationsAwareState {
    teamIterations: TeamIterationsMap;
}