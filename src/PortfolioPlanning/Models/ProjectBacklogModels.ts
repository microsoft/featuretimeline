export interface ProjectBacklogConfiguration {
    projectId: string;

    /**
     * Default work item type associated to the Microsoft.EpicCategory portfolio backlog level for the project.
     */
    defaultEpicWorkItemType: string;

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
    effortFieldRefName: string;
}

export interface ProjectConfiguration extends ProjectBacklogConfiguration {
    /**
     * Name of the OData column used for retrieving work item effort information.
     * e.g. Size, StoryPoints, Effort, Custom_MyEffortField, etc...
     */
    effortODataColumnName: string;
}

//
//  V2 Models
//

export interface PortfolioLevel {
    id: string;
    name: string;
    rank: number;
    defaultWorkItemType: string;
    orderedWorkItemTypes: string[];
    color: string;
}

export interface ProjectBacklogConfiguration2 {
    projectId: string;

    orderedPortfolioLevels: PortfolioLevel[];

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
    effortFieldRefName: string;
}

export interface ProjectConfiguration2 extends ProjectBacklogConfiguration2 {
    /**
     * Name of the OData column used for retrieving work item effort information.
     * e.g. Size, StoryPoints, Effort, Custom_MyEffortField, etc...
     */
    effortODataColumnName: string;
}
