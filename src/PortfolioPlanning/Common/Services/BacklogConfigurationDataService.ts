import { TeamContext } from "TFS/Core/Contracts";
import { BacklogConfiguration } from "TFS/Work/Contracts";
import { getClient } from "VSS/Service";
import { WorkHttpClient } from "TFS/Work/RestClient";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";
import { IWorkItemIcon } from "../../Contracts";
import { ProjectBacklogConfiguration } from "../../Models/ProjectBacklogModels";
import { stringifyMSJSON } from "VSS/Utils/Core";

export class BacklogConfigurationDataService {
    private static readonly EffortTypeField: string = "Effort";
    private static _instance: BacklogConfigurationDataService;

    public static getInstance(): BacklogConfigurationDataService {
        if (!BacklogConfigurationDataService._instance) {
            BacklogConfigurationDataService._instance = new BacklogConfigurationDataService();
        }
        return BacklogConfigurationDataService._instance;
    }

    public async getProjectBacklogConfiguration(projectId: string): Promise<ProjectBacklogConfiguration> {
        const client = this.getWorkClient();
        const teamContext: TeamContext = {
            projectId: projectId,
            team: null,
            teamId: null,
            project: null
        };

        const projectBacklogConfiguration: BacklogConfiguration = await client.getBacklogConfigurations(teamContext);

        const projectEfforFieldRefName =
            projectBacklogConfiguration.backlogFields &&
            projectBacklogConfiguration.backlogFields.typeFields[BacklogConfigurationDataService.EffortTypeField]
                ? projectBacklogConfiguration.backlogFields.typeFields[BacklogConfigurationDataService.EffortTypeField]
                : null;

        const portfolioLevelsData = this.getPortfolioLevelsData(projectBacklogConfiguration);

        return {
            projectId,

            defaultRequirementWorkItemType: this.getDefaultWorkItemTypeForRequirementBacklog(
                projectBacklogConfiguration
            ),

            effortFieldRefName: projectEfforFieldRefName,

            orderedWorkItemTypes: portfolioLevelsData.orderedWorkItemTypes,
            backlogLevelNamesByWorkItemType: portfolioLevelsData.backlogLevelNamesByWorkItemType
        };
    }

    public async getWorkItemTypeIconInfo(projectId: string, workItemType: string): Promise<IWorkItemIcon> {
        const client = this.getWorkItemTrackingClient();
        const workItemTypeData = await client.getWorkItemType(projectId, workItemType);

        return {
            workItemType: workItemType,
            name: workItemTypeData.icon.id,
            color: workItemTypeData.color
        };
    }

    private getPortfolioLevelsData(
        backlogConfiguration: BacklogConfiguration
    ): {
        orderedWorkItemTypes: string[];
        backlogLevelNamesByWorkItemType: { [workItemTypeKey: string]: string };
    } {
        let result = {
            orderedWorkItemTypes: [],
            backlogLevelNamesByWorkItemType: {}
        };

        if (
            backlogConfiguration &&
            backlogConfiguration.portfolioBacklogs &&
            backlogConfiguration.portfolioBacklogs.length > 0
        ) {
            const allPortfolios = backlogConfiguration.portfolioBacklogs;

            if (allPortfolios.length > 1) {
                //  Sort by rank ascending.
                allPortfolios.sort((a, b) => a.rank - b.rank);

                //  Ignore first level.
                allPortfolios.splice(0, 1);
            }

            allPortfolios.forEach(level => {
                let { name, workItemTypes, defaultWorkItemType } = level;

                if (!workItemTypes) {
                    workItemTypes = [];
                }

                if (!defaultWorkItemType) {
                    defaultWorkItemType = {
                        name: null,
                        url: null
                    };
                }

                const levelOrderedTypes: string[] = [];

                //  Always show default type first.
                if (defaultWorkItemType.name) {
                    levelOrderedTypes.push(defaultWorkItemType.name);
                    result.backlogLevelNamesByWorkItemType[defaultWorkItemType.name.toLowerCase()] = name;
                }

                //  Add other types.
                workItemTypes.forEach(wiType => {
                    if (wiType.name && wiType.name.toLowerCase() !== defaultWorkItemType.name!.toLowerCase()) {
                        levelOrderedTypes.push(wiType.name);
                        result.backlogLevelNamesByWorkItemType[wiType.name.toLowerCase()] = name;
                    }
                });
            });
        }

        return result;
    }

    private getDefaultWorkItemTypeForRequirementBacklog(backlogConfiguration: BacklogConfiguration): string {
        let result: string = null;

        if (
            backlogConfiguration &&
            backlogConfiguration.requirementBacklog &&
            backlogConfiguration.requirementBacklog.defaultWorkItemType
        ) {
            result = backlogConfiguration.requirementBacklog.defaultWorkItemType.name;
        }

        return result;
    }

    private getWorkClient(): WorkHttpClient {
        return getClient(WorkHttpClient);
    }

    private getWorkItemTrackingClient(): WorkItemTrackingHttpClient {
        return getClient(WorkItemTrackingHttpClient);
    }
}
