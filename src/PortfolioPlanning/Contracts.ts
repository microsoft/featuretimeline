import moment = require("moment");
import { IListBoxItem } from "azure-devops-ui/ListBox";

export interface IProject {
    id: string;
    title: string;
}

export interface IWorkItemIcon {
    workItemType: string;
    name: string;
    color: string;
    url: string;
}

export interface IProjectConfiguration {
    id: string;

    /**
     * Default work item type associated to the Microsoft.RequirementCategory backlog level for the project.
     */
    defaultRequirementWorkItemType: string;

    /**
     * Work item field ref name containing effort data for project.
     * e.g.:
     * Microsoft.VSTS.Scheduling.Effort
     * Microsoft.VSTS.Scheduling.StoryPoints
     * Microsoft.VSTS.Scheduling.Size
     * Custom.MyEffortField
     */
    effortWorkItemFieldRefName: string;

    /**
     * Column name in the OData schema for Effort.
     */
    effortODataColumnName: string;

    /**
     * Set of work item types, ordered by backlog level first, then by whether or not type is default in the backlog level.
     */
    orderedWorkItemTypes: string[];

    backlogLevelNamesByWorkItemType: { [workItemTypeKey: string]: string };

    iconInfoByWorkItemType: { [workItemTypeKey: string]: IWorkItemIcon };
}

export interface ITeam {
    teamId: string;
    teamName: string;
}

export interface IWorkItem {
    id: number;
    project: string;
    teamId: string;
    backlogLevel: string;
    title: string;
    iconProps: IWorkItemIcon;

    startDate?: Date;
    endDate?: Date;

    completedCount: number;
    totalCount: number;

    completedEffort: number;
    totalEffort: number;

    effortProgress: number;
    countProgress: number;
}

export interface IAddItems {
    planId: string;
    projectId: string;
    items: IAddItem[];
    projectConfiguration: IProjectConfiguration;
}

export interface IAddItem {
    id: number;
    workItemType: string;
}

export interface IRemoveItem {
    planId: string;
    itemIdToRemove: number;
}

export interface ITimelineGroup {
    id: string;
    title: string;
}

export interface ITimelineItem {
    id: number;
    group: string;
    teamId: string;
    backlogLevel: string;
    title: string;
    start_time: moment.Moment;
    end_time: moment.Moment;
}

export enum ProgressTrackingCriteria {
    CompletedCount = "Completed Count",
    Effort = "Effort"
}

export enum LoadingStatus {
    NotLoaded,
    Loaded,
    Loading
}

export class ExtensionConstants {
    public static EXTENSION_ID: string = "workitem-feature-timeline-extension";
    public static EXTENSION_ID_BETA: string = `${ExtensionConstants.EXTENSION_ID}-beta`;
    public static CURRENT_PORTFOLIO_SCHEMA_VERSION: number = 2;
}

export class IAddItemPanelProjectItems {
    [workItemTypeKey: string]: {
        workItemTypeDisplayName: string;
        loadingStatus: LoadingStatus;
        loadingErrorMessage: string;
        /**
         * Contains work items that should be displayed in the panel. i.e. work items found in
         * project, except those that are already part of the plan.
         */
        items: IListBoxItem[];

        /**
         * Count of all work items of this type found in the project.
         */
        workItemsFoundInProject: number;
    };
}
