import { TeamContext } from "TFS/Core/Contracts";
import { BacklogConfiguration, BacklogLevelConfiguration } from "TFS/Work/Contracts";
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

        const epicPortfolioLevel = this.getEpicPortfolioLevelData(projectBacklogConfiguration);

        return {
            projectId,

            epicBacklogLevelName: epicPortfolioLevel.backlogLevelName,

            defaultEpicWorkItemType: epicPortfolioLevel.defaultWorkItemType,

            defaultRequirementWorkItemType: this.getDefaultWorkItemTypeForRequirementBacklog(
                projectBacklogConfiguration
            ),

            effortFieldRefName: projectEfforFieldRefName
        };
    }

    private getEpicPortfolioLevelData(
        backlogConfiguration: BacklogConfiguration
    ): {
        defaultWorkItemType: string;
        backlogLevelName: string;
    } {
        let result = {
            defaultWorkItemType: null,
            backlogLevelName: null
        };

        if (
            backlogConfiguration &&
            backlogConfiguration.portfolioBacklogs &&
            backlogConfiguration.portfolioBacklogs.length > 0
        ) {
            const allPortfolios = backlogConfiguration.portfolioBacklogs;
            let selectedLevel: BacklogLevelConfiguration = null;

            if (allPortfolios.length === 1) {
                selectedLevel = allPortfolios[0];
            } else {
                //  Sort by rank ascending.
                allPortfolios.sort((a, b) => a.rank - b.rank);

                //  Ignore first level.
                allPortfolios.splice(0, 1);

                selectedLevel = allPortfolios[0];
            }

            if (selectedLevel) {
                result.defaultWorkItemType = selectedLevel.defaultWorkItemType
                    ? selectedLevel.defaultWorkItemType.name
                    : null;

                result.backlogLevelName = selectedLevel.name;
            }
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
}
