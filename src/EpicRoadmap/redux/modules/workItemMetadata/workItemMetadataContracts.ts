import { WorkItemType, WorkItemStateColor } from "azure-devops-extension-api/WorkItemTracking";
import { IDictionaryStringTo } from "../../../../Common/redux/Contracts/types";

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