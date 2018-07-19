import { WorkItem } from "TFS/WorkItemTracking/Contracts";
import { Action } from "redux";

export enum WorkItemLevel {
    Parent,
    Current,
    Child
}

export enum StateCategory {
    Proposed,
    InProgress,
    Resolved,
    Completed,
    Removed
}

export interface IWorkItemInfo {    
    workItem: WorkItem;
    children: number[];
    parent: number;
    level: WorkItemLevel;
    stateCategory: StateCategory;
}

export interface IWorkItemsState {
    workItemInfos: IDictionaryNumberTo<IWorkItemInfo>;
}

export interface TrackableAction extends Action {
    track: boolean;
}