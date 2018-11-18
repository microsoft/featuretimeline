import { ActionCreator } from 'redux';
import { TeamSettingsIterationReceivedAction, TeamSettingsIterationReceivedType, } from './actions';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';

export const teamSettingsIterationReceived: ActionCreator<TeamSettingsIterationReceivedAction> =
    (projectId: string, teamId: string, TeamSettingsIterations: TeamSettingsIteration[]) => ({
        type: TeamSettingsIterationReceivedType,
        payload: {
            projectId,
            teamId,
            TeamSettingsIterations
        }
    });


    