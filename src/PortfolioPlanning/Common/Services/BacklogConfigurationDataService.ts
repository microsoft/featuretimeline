import { TeamContext } from "TFS/Core/Contracts";
import { BacklogConfiguration } from "TFS/Work/Contracts";
import { getClient } from "VSS/Service";
import { WorkHttpClient } from "TFS/Work/RestClient";
import { ProjectBacklogConfiguration } from "../../Models/ProjectBacklogModels";

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

            effortFieldRefName: projectEfforFieldRefName,

            backlogLevelNameForNavigatingToRoadMap: this.getbacklogLevelNameForNavigatingToRoadMap(
                projectBacklogConfiguration,
                BacklogLevelCategory.Epic
            )
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
        let targetPortfolioBacklog = null;
        if(backlogConfiguration.portfolioBacklogs.length === 1) {
            targetPortfolioBacklog = backlogConfiguration.portfolioBacklogs[0];
        }
        else if (backlogConfiguration.portfolioBacklogs.length > 1) {
            targetPortfolioBacklog = backlogConfiguration.portfolioBacklogs.sort((a, b) => (a.rank - b.rank))[1];
        }

        if (targetPortfolioBacklog && targetPortfolioBacklog.id === backlogLevelCategoryId) {
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

    // This function duplicates some logic from the getDefaultWorkItemTypeForPortfolioBacklog.
    // Todo: Move the duplicate logic to a common place.
    private getbacklogLevelNameForNavigatingToRoadMap(
        backlogConfiguration: BacklogConfiguration,
        backlogLevelCategoryId: BacklogLevelCategory
    ): string {
        let result: string = null;

        if (!backlogConfiguration) {
            return result;
        }

        let targetPortfolioBacklog = null;
        if(backlogConfiguration.portfolioBacklogs.length === 1) {
            targetPortfolioBacklog = backlogConfiguration.portfolioBacklogs[0];
        }
        else if (backlogConfiguration.portfolioBacklogs.length > 1) {
            targetPortfolioBacklog = backlogConfiguration.portfolioBacklogs.sort((a, b) => (a.rank - b.rank))[1];
        }

        if (targetPortfolioBacklog && targetPortfolioBacklog.id === backlogLevelCategoryId) {
            const levelsFound = backlogConfiguration.portfolioBacklogs.filter(
                level => level.id.toLowerCase() === backlogLevelCategoryId.toLowerCase()
            );

            if (levelsFound.length > 0 && levelsFound[0].defaultWorkItemType) {
                result = levelsFound[0].name;
            }
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
