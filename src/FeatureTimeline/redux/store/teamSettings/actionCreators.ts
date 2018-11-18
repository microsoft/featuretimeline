import { ActionCreator } from 'redux';
import { TeamSettingReceivedAction, TeamSettingReceivedType } from './actions';
import { TeamSetting } from 'azure-devops-extension-api/Work';

export const teamSettingsReceived: ActionCreator<TeamSettingReceivedAction> =
    (projectId: string, teamId: string, teamSetting: TeamSetting) => ({
        type: TeamSettingReceivedType,
        payload: {
            projectId,
            teamId,
            teamSetting
        }
    });

