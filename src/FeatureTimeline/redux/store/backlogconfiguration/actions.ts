import { Action } from "redux";
import { BacklogConfiguration } from "azure-devops-extension-api/Work";

export const BacklogConfigurationReceivedType = "@@backlogconfiguration/BacklogConfigurationReceived";

export interface BacklogConfigurationReceivedAction extends Action {
    type: "@@backlogconfiguration/BacklogConfigurationReceived";
    payload: {
        projectId: string;
        teamId: string;
        backlogConfiguration: BacklogConfiguration;
    }
}

export type BacklogConfigurationActions = BacklogConfigurationReceivedAction;