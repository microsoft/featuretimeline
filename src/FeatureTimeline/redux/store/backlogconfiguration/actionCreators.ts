import { ActionCreator } from 'redux';
import { BacklogConfigurationReceivedAction, BacklogConfigurationReceivedType } from './actions';
import { BacklogConfiguration } from 'TFS/Work/Contracts';

export const backlogConfigurationReceived: ActionCreator<BacklogConfigurationReceivedAction> =
    (projectId: string, teamId: string, backlogConfiguration: BacklogConfiguration) => ({
        type: BacklogConfigurationReceivedType,
        payload: {
            projectId,
            teamId,
            backlogConfiguration
        }
    });

