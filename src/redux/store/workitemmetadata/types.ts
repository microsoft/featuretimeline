import { WorkItemType, WorkItemStateColor } from "TFS/WorkItemTracking/Contracts";

export interface IWorkItemMetadata {
    workItemTypes: WorkItemType[];
    // workItemType => stateColor
    workItemStateColors: IDictionaryStringTo<WorkItemStateColor[]>;
}

export interface IWorkItemMetadataState {
    // project -> WorkItemMetadata
    metadata: IDictionaryStringTo<IWorkItemMetadata>;
}