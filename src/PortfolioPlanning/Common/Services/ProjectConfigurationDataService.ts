import { IProjectConfiguration, IWorkItemIcon } from "../../Contracts";
import { BacklogConfigurationDataService } from "./BacklogConfigurationDataService";
import { PortfolioPlanningDataService } from "./PortfolioPlanningDataService";

export class ProjectConfigurationDataService {
    private static _instance: ProjectConfigurationDataService;

    public static getInstance(): ProjectConfigurationDataService {
        if (!ProjectConfigurationDataService._instance) {
            ProjectConfigurationDataService._instance = new ProjectConfigurationDataService();
        }
        return ProjectConfigurationDataService._instance;
    }

    public async getProjectConfiguration(projectId: string): Promise<IProjectConfiguration> {
        const backlogConfiguration = await BacklogConfigurationDataService.getInstance().getProjectBacklogConfiguration(
            projectId
        );

        const effortODataColumnName = await PortfolioPlanningDataService.getInstance().getODataColumnNameFromWorkItemFieldReferenceName(
            backlogConfiguration.effortFieldRefName
        );

        const allResults = await Promise.all(
            backlogConfiguration.orderedWorkItemTypes.map(
                async workItemType =>
                    await BacklogConfigurationDataService.getInstance().getWorkItemTypeIconInfo(projectId, workItemType)
            )
        );

        const iconInfoByWorkItemType: { [workItemTypeKey: string]: IWorkItemIcon } = {};
        allResults.forEach(iconData => {
            const workItemTypeKey = iconData.workItemType.toLowerCase();
            iconInfoByWorkItemType[workItemTypeKey] = iconData;
        });

        return {
            id: projectId,
            defaultRequirementWorkItemType: backlogConfiguration.defaultRequirementWorkItemType,
            effortWorkItemFieldRefName: backlogConfiguration.effortFieldRefName,
            effortODataColumnName,
            orderedWorkItemTypes: backlogConfiguration.orderedWorkItemTypes,
            backlogLevelNamesByWorkItemType: backlogConfiguration.backlogLevelNamesByWorkItemType,
            iconInfoByWorkItemType
        };
    }
}
