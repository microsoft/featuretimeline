import { WorkItem } from "TFS/WorkItemTracking/Contracts";
import { Action } from "redux";
import { StateCategory } from "../../../../Common/redux/Contracts/types";

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
    stateCategory: StateCategory;
}

export interface IWorkItemsState {
    workItemInfos: IDictionaryNumberTo<IWorkItemInfo>;
}

export interface TrackableAction extends Action {
    track: boolean;
}