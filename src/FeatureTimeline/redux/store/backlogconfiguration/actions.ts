import { Action } from "redux";
import { BacklogConfiguration } from "TFS/Work/Contracts";

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