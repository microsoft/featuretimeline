import { TeamContext } from "TFS/Core/Contracts";
import { BacklogConfiguration } from "TFS/Work/Contracts";
import { getClient } from "VSS/Service";
import { WorkHttpClient } from "TFS/Work/RestClient";
import {
    ProjectBacklogConfiguration,
    ProjectBacklogConfiguration2,
    PortfolioLevel
} from "../../Models/ProjectBacklogModels";

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

        return {
            projectId,

            defaultEpicWorkItemType: this.getDefaultWorkItemTypeForPortfolioBacklog(
                projectBacklogConfiguration,
                BacklogLevelCategory.Epic
            ),

            defaultRequirementWorkItemType: this.getDefaultWorkItemTypeForPortfolioBacklog(
                projectBacklogConfiguration,
                BacklogLevelCategory.Requirement
            ),

            effortFieldRefName: projectEfforFieldRefName
        };
    }

    private getDefaultWorkItemTypeForPortfolioBacklog(
        backlogConfiguration: BacklogConfiguration,
        backlogLevelCategoryId: BacklogLevelCategory
    ): string {
        let result: string = null;

        if (!backlogConfiguration) {
            return result;
        }

        if (BacklogLevelCategory.Epic === backlogLevelCategoryId) {
            const levelsFound = backlogConfiguration.portfolioBacklogs.filter(
                level => level.id.toLowerCase() === backlogLevelCategoryId.toLowerCase()
            );

            if (levelsFound.length > 0 && levelsFound[0].defaultWorkItemType) {
                result = levelsFound[0].defaultWorkItemType.name;
            }
        } else if (
            BacklogLevelCategory.Requirement === backlogLevelCategoryId &&
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
}

export enum BacklogLevelCategory {
    Requirement = "Microsoft.RequirementCategory",
    Epic = "Microsoft.EpicCategory"
}

export class BacklogConfigurationDataService2 {
    private static readonly EffortTypeField: string = "Effort";
    private static _instance: BacklogConfigurationDataService2;

    public static getInstance(): BacklogConfigurationDataService2 {
        if (!BacklogConfigurationDataService2._instance) {
            BacklogConfigurationDataService2._instance = new BacklogConfigurationDataService2();
        }
        return BacklogConfigurationDataService2._instance;
    }

    public async getProjectBacklogConfiguration(projectId: string): Promise<ProjectBacklogConfiguration2> {
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
            projectBacklogConfiguration.backlogFields.typeFields[BacklogConfigurationDataService2.EffortTypeField]
                ? projectBacklogConfiguration.backlogFields.typeFields[BacklogConfigurationDataService2.EffortTypeField]
                : null;

        return {
            projectId,

            orderedPortfolioLevels: this.getOrderedPortfolioLevels(projectBacklogConfiguration),

            defaultRequirementWorkItemType: this.getDefaultWorkItemTypeForRequirementBacklogLevel(
                projectBacklogConfiguration
            ),

            effortFieldRefName: projectEfforFieldRefName
        };
    }

    private getOrderedPortfolioLevels(backlogConfiguration: BacklogConfiguration): PortfolioLevel[] {
        let result: PortfolioLevel[] = [];

        if (backlogConfiguration && backlogConfiguration.portfolioBacklogs) {
            let levels = backlogConfiguration.portfolioBacklogs;

            //  Sort by rank.
            levels.sort((a, b) => a.rank - b.rank);

            //  If more than 2 levels, first one should be ignored - we don't want to show "Features"
            //  portfolio level.
            if (levels.length > 1) {
                levels.splice(0, 1);
            }

            result = levels.map(level => {
                return {
                    id: level.id,
                    name: level.name,
                    rank: level.rank,
                    defaultWorkItemType: level.defaultWorkItemType.name,
                    orderedWorkItemTypes: level.workItemTypes.map(wi => wi.name),
                    color: level.color
                };
            });
        }

        return result;
    }

    private getDefaultWorkItemTypeForRequirementBacklogLevel(backlogConfiguration: BacklogConfiguration): string {
        let result: string = null;

        if (!backlogConfiguration) {
            return result;
        }

        if (backlogConfiguration.requirementBacklog && backlogConfiguration.requirementBacklog.defaultWorkItemType) {
            result = backlogConfiguration.requirementBacklog.defaultWorkItemType.name;
        }

        return result;
    }

    private getWorkClient(): WorkHttpClient {
        return getClient(WorkHttpClient);
    }
}
