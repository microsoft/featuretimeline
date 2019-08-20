import { ODataQueryProjectInput } from "./ODataQueryModels";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { IProjectConfiguration } from "../Contracts";

export interface PortfolioPlanningQueryInput {
    /**
     * Work item ids and their projects.
     */
    WorkItems: ODataQueryProjectInput[];
}

export interface PortfolioPlanningQueryResult extends IQueryResultError {
    items: PortfolioPlanningQueryResultItem[];
}

export interface PortfolioPlanningQueryResultItem {
    WorkItemId: number;
    WorkItemType: string;
    Title: string;
    State: string;

    StartDate: Date;
    TargetDate: Date;

    ProjectId: string;
    AreaId: string;
    TeamId: string;

    CompletedCount: number;
    TotalCount: number;

    CompletedEffort: number;
    TotalEffort: number;

    EffortProgress: number;
    CountProgress: number;
}

export interface PortfolioPlanningProjectQueryInput {
    projects: { [projectId: string]: boolean };
}

export interface PortfolioPlanningProjectQueryResult extends IQueryResultError {
    projects: Project[];
}

export interface PortfolioPlanningWorkItemQueryResult extends IQueryResultError {
    workItems: WorkItem[];
}

export interface Project {
    ProjectSK: string;
    ProjectName: string;
}

export interface WorkItem {
    WorkItemId: number;
    WorkItemType: string;
    Title: string;
    State: string;
}

export interface IQueryResultError {
    exceptionMessage: string;
    status?: number;
}

export interface PortfolioPlanningMetadata {
    id: string;
    name: string;
    description: string;
    teamNames: string[];
    projectNames: string[];
    owner: IdentityRef;
    createdOn: Date;
    SchemaVersion: number;
}

export interface PortfolioPlanning extends PortfolioPlanningMetadata {
    projects: { [projectId: string]: ProjectPortfolioPlanning };
}

export interface PortfolioItem {
    workItemId: number;
    workItemType: string;
}

export interface IconProps {
    name: string;
    color: string;
    url: string;
}

export interface WorkItemType {
    workItemType: string;
    backlogLevelName: string;
    iconProps: IconProps;
}

export interface ProjectPortfolioPlanning {
    /**
     * V1 Properties.
     */
    ProjectId: string;
    PortfolioWorkItemType?: string; //  deprecated in V2.
    PortfolioBacklogLevelName?: string; // deprecated in V2.
    RequirementWorkItemType: string;
    EffortODataColumnName: string;
    EffortWorkItemFieldRefName: string;
    WorkItemIds?: number[]; // deprecated in v2

    /**
     * V2 changes.
     *
     * Deprecated properties:
     * - PortfolioWorkItemType
     * - PortfolioBacklogLevelName
     * - WorkItemIds
     *
     * Added properties:
     * - Items
     * - WorkItemTypeData
     */
    Items: { [workItemId: number]: PortfolioItem };

    WorkItemTypeData: { [workItemTypeKey: string]: WorkItemType };
}

export interface PortfolioPlanningDirectory extends IQueryResultError {
    id: string;
    entries: PortfolioPlanningMetadata[];
}

export interface ExtensionStorageError {
    stack: string;
    message: string;
    name: string;
    status: number;
    responseText: string;
}

export interface PortfolioPlanningTeamsInAreaQueryInput {
    /**
     * AreaIds by project id.
     */
    [projectId: string]: { [areaId: string]: boolean };
}

export interface PortfolioPlanningTeamsInAreaQueryResult extends IQueryResultError {
    teamsInArea: TeamsInArea;
}

export interface TeamsInArea {
    [areaId: string]: Team[];
}

export interface Team {
    teamId: string;
    teamName: string;
}

export interface PortfolioPlanningFullContentQueryResult {
    items: PortfolioPlanningQueryResult;
    projects: PortfolioPlanningProjectQueryResult;
    teamAreas: PortfolioPlanningTeamsInAreaQueryResult;
    mergeStrategy: MergeType;
}

export enum MergeType {
    Add,
    Replace
}

export interface PortfolioPlanningWorkitemTypeFieldNameQueryInput {
    ProjectSK: string;
    FieldReferenceName: string;
    WorkItemType: string;
}

export interface PortfolioPlanningWorkItemTypeFieldNameQueryResult extends IQueryResultError {
    FieldType: string;
    FieldName: string;
}

export interface PortfolioPlanningDependencyQueryInput {
    workItemIds: number[];
}

export interface PortfolioPlanningDependencyQueryResult extends IQueryResultError {
    byProject: {
        //  Project id of the source work item(s)
        [projectId: string]: {
            //  predecessor
            Predecessors: PortfolioPlanningQueryResultItem[];

            //  successor
            Successors: PortfolioPlanningQueryResultItem[];
        };
    };
    targetsProjectConfiguration: { [projectId: string]: IProjectConfiguration };
}

export interface WorkItemLinksQueryInput {
    RefName: string;
    WorkItemIds: number[];
    WorkItemIdColumn: WorkItemLinkIdType;
}

export interface WorkItemLinksQueryResult extends IQueryResultError {
    Links: WorkItemLink[];
    QueryInput: WorkItemLinksQueryInput;
}

export interface WorkItemLink {
    WorkItemLinkSK: string;
    SourceWorkItemId: number;
    TargetWorkItemId: number;
    LinkTypeReferenceName: string;
    ProjectSK: string;
}

export enum WorkItemLinkIdType {
    Source = "SourceWorkItemId",
    Target = "TargetWorkItemId"
}

export enum LinkTypeReferenceName {
    Successor = "System.LinkTypes.Dependency-Forward",
    Predecessor = "System.LinkTypes.Dependency-Reverse"
}

export interface WorkItemProjectId {
    WorkItemId: number;
    WorkItemType: string;
    ProjectSK: string;
}

export interface WorkItemProjectIdsQueryResult extends IQueryResultError {
    Results: WorkItemProjectId[];
    QueryInput: number[];
}
