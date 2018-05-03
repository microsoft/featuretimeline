import { WorkItem } from "TFS/WorkItemTracking/Contracts";
import { Action } from "redux";

export enum WorkItemLevel {
    Parent,
    Current,
    Child
}

export interface IWorkItemInfo {    
    workItem: WorkItem;
    children: number[];
    parent: number;
    level: WorkItemLevel;
}

export interface IWorkItemsState {
    workItemInfos: IDictionaryNumberTo<IWorkItemInfo>;
}

export interface TrackableAction extends Action {
    track: boolean;
}