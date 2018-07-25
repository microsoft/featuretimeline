import { WorkItemType, WorkItemStateColor } from "TFS/WorkItemTracking/Contracts";

export interface IWorkItemMetadata {
    workItemTypes: WorkItemType[];
    // workItemType => stateColor
    workItemStateColors: IDictionaryStringTo<WorkItemStateColor[]>;
}

// project -> WorkItemMetadata

export type ProjectWorkItemMetadataMap = IDictionaryStringTo<IWorkItemMetadata>;

export interface IWorkItemMetadataAwareState {
    // project -> WorkItemMetadata
    workItemMetadata: ProjectWorkItemMetadataMap;
}