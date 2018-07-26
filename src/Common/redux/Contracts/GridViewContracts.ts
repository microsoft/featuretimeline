import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { WorkItem, WorkItemStateColor } from "TFS/WorkItemTracking/Contracts";
import { IIterationDuration } from "./IIterationDuration";
import { CropWorkItem, IDimension } from "./types";
import { ISettingsState } from "../modules/SettingsState/SettingsStateContracts";

export interface IWorkItemDisplayDetails {
    id: number;
    title: string;
    color: string;
    workItemStateColor: WorkItemStateColor;
    isRoot: boolean;
    workItem: WorkItem;
    order: number;
    iterationDuration: IIterationDuration;
    showInfoIcon: boolean;
    isComplete: boolean;
    efforts: number;
    childrenWithNoEfforts: number;

    children: IWorkItemDisplayDetails[];
    
    predecessors: WorkItem[];
    successors: WorkItem[];
    highlightPredecessorIcon: boolean;
    highlighteSuccessorIcon: boolean;
}

export interface IGridIteration {
    teamIteration: TeamSettingsIteration;
    dimension: IDimension;
}
export interface IProgressIndicator {
    total: number;
    completed: number;
}

export interface IGridItem {
    dimension: IDimension;
}

export interface IGridWorkItem extends IGridItem {    
    workItem: IWorkItemDisplayDetails;
    progressIndicator: IProgressIndicator;
    crop: CropWorkItem;
    settingsState: ISettingsState;
    allowOverrideIteration: boolean;
}

export interface IGridIterationDisplayDetails {
    emptyHeaderRow: IDimension[]; //Set of empty elements to place items on top of iteration header
    iterationHeader: IGridIteration[];
    iterationShadow: IGridIteration[];
}

export interface IGridView extends IGridIterationDisplayDetails {    
    workItems: IGridWorkItem[];
    isSubGrid: boolean;
    shadowForWorkItemId: number;
    hideParents: boolean;
    iterationDisplayOptions: IIterationDisplayOptions;
    teamIterations: TeamSettingsIteration[];
    backlogIteration: TeamSettingsIteration,
    currentIterationIndex: number;
    separators: IDimension[];
}

export interface IIterationDisplayOptions {
    totalIterations: number
    originalCount: number;
    count: number;
    startIndex: number;
    endIndex: number;
    teamId: string;
    projectId: string;
}