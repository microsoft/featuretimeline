import { ActionCreator } from 'redux';
import { TeamSettingsIterationReceivedAction, TeamSettingsIterationReceivedType, } from './actions';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';

export const teamSettingsIterationReceived: ActionCreator<TeamSettingsIterationReceivedAction> =
    (projectId: string, teamId: string, TeamSettingsIterations: TeamSettingsIteration[]) => ({
        type: TeamSettingsIterationReceivedType,
        payload: {
            projectId,
            teamId,
            TeamSettingsIterations
        }
    });


    