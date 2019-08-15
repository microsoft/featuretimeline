import { TeamContext } from "TFS/Core/Contracts";
import { BacklogConfiguration } from "TFS/Work/Contracts";
import { getClient } from "VSS/Service";
import { WorkHttpClient } from "TFS/Work/RestClient";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";
import { IWorkItemIcon } from "../../Contracts";
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

        const portfolioLevelsData = this.getPortfolioLevelsData(projectBacklogConfiguration);

        return {
            projectId,

            defaultRequirementWorkItemType: this.getDefaultWorkItemTypeForRequirementBacklog(
                projectBacklogConfiguration
            ),

            effortFieldRefName: projectEfforFieldRefName,

            orderedWorkItemTypes: portfolioLevelsData.orderedWorkItemTypes,
            backlogLevelNamesByWorkItemType: portfolioLevelsData.backlogLevelNamesByWorkItemType,
        };
    }

    // returns a mapping for portfolio level work item type and its InProgress states.
    // For default Agile project, the value will be {epic: ["Active", "Resolved"]}
    public async getInProgressStates(projectId: string): Promise<{[key: string]: string[]}> {
        const client = this.getWorkClient();
        const teamContext: TeamContext = {
            projectId: projectId,
            team: null,
            teamId: null,
            project: null
        };

        const projectBacklogConfiguration: BacklogConfiguration = await client.getBacklogConfigurations(teamContext);
        const portfolioLevelsData = this.getPortfolioLevelsData(projectBacklogConfiguration);

        const workItemTypeMappedStatesInProgress: {[key: string]: string[]} = {};
        projectBacklogConfiguration.workItemTypeMappedStates.forEach(item => {
            if(Object.keys(portfolioLevelsData.backlogLevelNamesByWorkItemType).indexOf(item.workItemTypeName.toLowerCase()) !== -1){
                const statesForInProgress = Object.keys(item.states).filter(key => item.states[key] === "InProgress");
                workItemTypeMappedStatesInProgress[item.workItemTypeName.toLowerCase()] = statesForInProgress;
             }
        })
        return workItemTypeMappedStatesInProgress;
    }

    public async getWorkItemTypeIconInfo(projectId: string, workItemType: string): Promise<IWorkItemIcon> {
        const client = this.getWorkItemTrackingClient();
        const workItemTypeData = await client.getWorkItemType(projectId, workItemType);

        return {
            workItemType: workItemType,
            name: workItemTypeData.icon.id,
            color: workItemTypeData.color,
            url: workItemTypeData.icon.url
        };
    }

    public async getDefaultWorkItemTypeForV1(projectId: string): Promise<string> {
        const client = this.getWorkClient();
        const teamContext: TeamContext = {
            projectId: projectId,
            team: null,
            teamId: null,
            project: null
        };
        const backlogConfiguration: BacklogConfiguration = await client.getBacklogConfigurations(teamContext);
        if (
            backlogConfiguration &&
            backlogConfiguration.portfolioBacklogs &&
            backlogConfiguration.portfolioBacklogs.length > 0
        ) {
            const allPortfolios = backlogConfiguration.portfolioBacklogs;
            if (allPortfolios.length > 1) {
                // Sort by rank ascending.
                allPortfolios.sort((a, b) => a.rank - b.rank);
                // Ignore first level.
                allPortfolios.splice(0, 1);
            }
            return allPortfolios[0].defaultWorkItemType.name;
        }
        return Promise.resolve(null);
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

            //  Now order by rank desc to show highest levels first.
            allPortfolios.sort((a, b) => b.rank - a.rank);

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

                //  Always show default type first.
                if (defaultWorkItemType.name) {
                    result.orderedWorkItemTypes.push(defaultWorkItemType.name);
                    result.backlogLevelNamesByWorkItemType[defaultWorkItemType.name.toLowerCase()] = name;
                }

                //  Add other types.
                workItemTypes.forEach(wiType => {
                    if (wiType.name && wiType.name.toLowerCase() !== defaultWorkItemType.name!.toLowerCase()) {
                        result.orderedWorkItemTypes.push(wiType.name);
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
