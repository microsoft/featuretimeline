export interface ProjectBacklogConfiguration {
    projectId: string;

    //
    //  Deprecated in V2.
    //
    // /**
    //  * Name of the Epic backlog level. Used for navigation to epic roadmap.
    //  */
    // epicBacklogLevelName: string;

    // /**
    //  * Default work item type associated to the Microsoft.EpicCategory portfolio backlog level for the project.
    //  */
    // defaultEpicWorkItemType: string;

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

    /**
     * TODO testing v2
     */
    orderedWorkItemTypes: string[];

    backlogLevelNamesByWorkItemType: { [workItemTypeKey: string]: string };
}

export interface ProjectConfiguration extends ProjectBacklogConfiguration {
    /**
     * Name of the OData column used for retrieving work item effort information.
     * e.g. Size, StoryPoints, Effort, Custom_MyEffortField, etc...
     */
    effortODataColumnName: string;
}
