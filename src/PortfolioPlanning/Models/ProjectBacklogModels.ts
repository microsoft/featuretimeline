export interface ProjectBacklogConfiguration {
    projectId: string;

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

    orderedWorkItemTypes: string[];

    backlogLevelNamesByWorkItemType: { [workItemTypeKey: string]: string };
}
