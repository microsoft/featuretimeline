import { BacklogConfiguration } from "azure-devops-extension-api/Work";

export type BacklogConfigurationMap = { [projectId: string]: BacklogConfiguration }

export interface IProjectBacklogConfigurationAwareState {
    backlogConfigurations: BacklogConfigurationMap;
}