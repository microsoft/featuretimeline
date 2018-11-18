import { BacklogConfiguration } from "azure-devops-extension-api/Work";
import { IDictionaryStringTo } from "../../../../Common/redux/Contracts/types";

export interface IBacklogConfigurationState {
    // project -> team -> Backlog Configuration
    backlogConfigurations: IDictionaryStringTo<IDictionaryStringTo<BacklogConfiguration>>;
}