import { ActionsUnion, createAction } from "../../../Common/ActionHelper";
import { BacklogConfiguration } from "TFS/Work/Contracts";

export const ProjectBacklogConfigurationReceivedType = "@@backlogconfiguration/ProjectBacklogConfigurationReceived";
export const renProjectBacklogConfigurationActionCreator = {
    backklogConfigurationReceived: (projectId: string, backlogConfiguration: BacklogConfiguration) =>
        createAction(ProjectBacklogConfigurationReceivedType, {
            projectId,
            backlogConfiguration
        })
}

export type ProjectBacklogConfigurationActions = ActionsUnion<typeof ProjectBacklogConfigurationActionCreator>;