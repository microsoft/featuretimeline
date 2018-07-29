import { BacklogConfiguration } from "TFS/Work/Contracts";
import { createAction, ActionsUnion } from '../../../../Common/redux/Helpers/ActionHelper';

export const ProjectBacklogConfigurationReceivedType = "@@backlogconfiguration/ProjectBacklogConfigurationReceived";
export const ProjectBacklogConfigurationActionCreator = {
    backlogConfigurationReceived: (projectId: string, backlogConfiguration: BacklogConfiguration) =>
        createAction(ProjectBacklogConfigurationReceivedType, {
            projectId,
            backlogConfiguration
        })
}

export type ProjectBacklogConfigurationActions = ActionsUnion<typeof ProjectBacklogConfigurationActionCreator>;