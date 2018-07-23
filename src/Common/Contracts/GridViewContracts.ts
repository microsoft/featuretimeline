import { WorkItemStateColor, WorkItem } from "TFS/WorkItemTracking/Contracts";
import { IIterationDuration } from "../../FeatureTimeline/redux/store/types";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { IDimension, CropWorkItem } from "./types";
import { ISettingsState } from "./OptionsInterfaces";

export interface IWorkItemDisplayDetails {
    id: number;
    title: string;
    color: string;
    workItemStateColor: WorkItemStateColor;
    isRoot: boolean;
    workItem: WorkItem;
    order: number;
    iterationDuration: IIterationDuration;
    children: IWorkItemDisplayDetails[];
    showInfoIcon: boolean;
    isComplete: boolean;
    efforts: number;
    childrenWithNoEfforts: number;
}

export interface IGridIteration {
    teamIteration: TeamSettingsIteration;
    dimension: IDimension;
}
export interface IProgressIndicator {
    total: number;
    completed: number;
}

export interface IGridWorkItem {
    dimension: IDimension;
    workItem: IWorkItemDisplayDetails;
    progressIndicator: IProgressIndicator;
    crop: CropWorkItem;
    settingsState: ISettingsState;
    gapColor?: string;
    isGap?: boolean;
}

export interface IGridView {
    emptyHeaderRow: IDimension[]; //Set of empty elements to place items on top of iteration header
    iterationHeader: IGridIteration[];
    iterationShadow: IGridIteration[];
    workItems: IGridWorkItem[];
    isSubGrid: boolean;
    workItemShadow: number;
    hideParents: boolean;
    iterationDisplayOptions: IIterationDisplayOptions;
    teamIterations: TeamSettingsIteration[];
    backlogIteration: TeamSettingsIteration,
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