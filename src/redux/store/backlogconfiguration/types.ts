import { BacklogConfiguration } from "TFS/Work/Contracts";

export interface IBacklogConfigurationState {
    // project -> team -> Backlog Configuration
    backlogConfigurations: IDictionaryStringTo<IDictionaryStringTo<BacklogConfiguration>>;
}