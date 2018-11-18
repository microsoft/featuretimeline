import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";
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
    workItemInfos: {[key: number]: IWorkItemInfo};
}

export interface TrackableAction extends Action {
    track: boolean;
}