import { put, call } from "redux-saga/effects";
import { effects } from "redux-saga";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
import {
    PortfolioPlanningQueryInput,
    PortfolioPlanning,
    PortfolioPlanningFullContentQueryResult,
    MergeType,
    ProjectPortfolioPlanning
} from "../../Models/PortfolioPlanningQueryModels";
import { EpicTimelineActions } from "../Actions/EpicTimelineActions";
import { SetDefaultDatesForWorkItems } from "./DefaultDateUtil";
import { PortfolioTelemetry } from "../../Common/Utilities/Telemetry";
import { ExtensionConstants, IProjectConfiguration, IWorkItemIcon } from "../../Contracts";
import { BacklogConfigurationDataService } from "../../Common/Services/BacklogConfigurationDataService";

export function* LoadPortfolio(planId: string) {
    const portfolioService = PortfolioPlanningDataService.getInstance();
    const planInfo: PortfolioPlanning = yield call([portfolioService, portfolioService.GetPortfolioPlanById], planId);

    // No data for this plan, just return empty info
    if (!planInfo.projects || Object.keys(planInfo.projects).length === 0) {
        const emptyQueryResult = {
            items: {
                exceptionMessage: null,
                items: []
            },
            projects: {
                exceptionMessage: null,
                projects: []
            },
            teamAreas: {
                exceptionMessage: null,
                teamsInArea: {}
            },
            mergeStrategy: MergeType.Replace
        };

        yield put(EpicTimelineActions.portfolioItemsReceived(emptyQueryResult, {}));

        return;
    }

    //  Patch data to match latest storage schema.
    const compliantPlanInfo: PortfolioPlanning = yield call(PatchPorfolioSchema, planInfo);

    //  TODO
    //  After schema is upgraded, this would be a good place to refresh stored data.
    //  For example:
    //  -   Check identity ref data is latest.
    //  -   Clean-up list of team names and projects to remove those for which there are no work items anymore in the plan.

    //  Loading latest items' data.
    const projectConfigurations: { [projectId: string]: IProjectConfiguration } = {};

    const portfolioQueryInput: PortfolioPlanningQueryInput = {
        WorkItems: Object.keys(compliantPlanInfo.projects).map(projectKey => {
            const projectInfo: ProjectPortfolioPlanning = compliantPlanInfo.projects[projectKey];
            const workItemIds = Object.keys(projectInfo.Items).map(id => Number(id));

            //  Recreate ProjectConfigurations from plans storage.
            const backlogLevelNamesByWorkItemType: { [workItemTypeKey: string]: string } = {};
            const iconInfoByWorkItemType: { [workItemTypeKey: string]: IWorkItemIcon } = {};

            Object.keys(projectInfo.WorkItemTypeData).forEach(workItemType => {
                const workItemTypeData = projectInfo.WorkItemTypeData[workItemType];
                const workItemTypeKey = workItemType.toLowerCase();

                backlogLevelNamesByWorkItemType[workItemTypeKey] = workItemTypeData.backlogLevelName;
                iconInfoByWorkItemType[workItemTypeKey] = {
                    workItemType: workItemType,
                    name: workItemTypeData.iconProps.name,
                    color: workItemTypeData.iconProps.color,
                    url: workItemTypeData.iconProps.url
                };
            });

            projectConfigurations[projectKey.toLowerCase()] = {
                id: projectKey,
                defaultRequirementWorkItemType: projectInfo.RequirementWorkItemType,
                effortWorkItemFieldRefName: projectInfo.EffortWorkItemFieldRefName,
                effortODataColumnName: projectInfo.EffortODataColumnName,
                orderedWorkItemTypes: null, // Not needed by timeline, only used in AddPanel, which fetches data every time it's opened.
                backlogLevelNamesByWorkItemType,
                iconInfoByWorkItemType
            };

            return {
                projectId: projectInfo.ProjectId,
                workItemIds,
                DescendantsWorkItemTypeFilter: projectInfo.RequirementWorkItemType,
                EffortWorkItemFieldRefName: projectInfo.EffortWorkItemFieldRefName,
                EffortODataColumnName: projectInfo.EffortODataColumnName
            };
        })
    };

    const queryResult: PortfolioPlanningFullContentQueryResult = yield call(
        [portfolioService, portfolioService.loadPortfolioContent],
        portfolioQueryInput
    );

    //  Update work item dates.
    yield effects.call(SetDefaultDatesForWorkItems, queryResult);

    //  Replace all values when merging. We are loading the full state of the portfolio here.
    queryResult.mergeStrategy = MergeType.Replace;

    yield put(EpicTimelineActions.portfolioItemsReceived(queryResult, projectConfigurations));
}

function PatchPorfolioSchema(planInfo: PortfolioPlanning): Promise<PortfolioPlanning> {
    const { SchemaVersion } = planInfo;

    if (!SchemaVersion) {
        return UpgradeFromV1ToV2.Upgrade(planInfo);
    } else if (SchemaVersion !== ExtensionConstants.CURRENT_PORTFOLIO_SCHEMA_VERSION) {
        const corruptedVersion: Error = {
            name: "CorruptedPortfolioPlanSchema",
            message: "Storage for this plan is corrupted, and data cannot be recover. Please create a new plan."
        };
        throw corruptedVersion;
    } else {
        //  Version is current.
        return Promise.resolve(planInfo);
    }
}

class UpgradeFromV1ToV2 {
    private static VersionUpgrade = {
        ["From"]: "V1",
        ["To"]: "V2"
    };

    public static async Upgrade(planInfo: PortfolioPlanning): Promise<PortfolioPlanning> {
        PortfolioTelemetry.getInstance().TrackAction("PortfolioPlanning/SchemaUpgrade/Started", this.VersionUpgrade);

        Object.keys(planInfo.projects).forEach(async projectKey => {
            let { PortfolioWorkItemType, PortfolioBacklogLevelName, WorkItemIds } = planInfo.projects[projectKey];

            const workItemTypeKey = PortfolioWorkItemType.toLowerCase();

            //  Get work item icon info for work item type.
            const iconInfo = await BacklogConfigurationDataService.getInstance().getWorkItemTypeIconInfo(
                projectKey,
                PortfolioWorkItemType
            );

            //  Check if we have info on the backlog level name for the default work item type.
            if (!PortfolioBacklogLevelName) {
                PortfolioTelemetry.getInstance().TrackAction("MissingBacklogLevelNameWhileLoadingPortfolio");
                const projectBacklogConfig = await BacklogConfigurationDataService.getInstance().getProjectBacklogConfiguration(
                    projectKey
                );
                PortfolioBacklogLevelName = projectBacklogConfig.backlogLevelNamesByWorkItemType[workItemTypeKey];
            }

            //  Add new schema info: Items and WorkItemTypeData.
            planInfo.projects[projectKey].Items = {};
            planInfo.projects[projectKey].WorkItemTypeData = {};

            if (WorkItemIds && WorkItemIds.length > 0) {
                WorkItemIds.forEach(workItemId => {
                    if (!planInfo.projects[projectKey].Items[workItemId]) {
                        planInfo.projects[projectKey].Items[workItemId] = {
                            workItemId,
                            workItemType: PortfolioWorkItemType
                        };
                    }

                    if (!planInfo.projects[projectKey].WorkItemTypeData[workItemTypeKey]) {
                        planInfo.projects[projectKey].WorkItemTypeData[workItemTypeKey] = {
                            workItemType: PortfolioWorkItemType,
                            backlogLevelName: PortfolioBacklogLevelName,
                            iconProps: {
                                name: iconInfo.name,
                                color: iconInfo.color,
                                url: iconInfo.url
                            }
                        };
                    }
                });
            }

            //  Delete deprecated properties.
            planInfo.projects[projectKey].PortfolioWorkItemType = null;
            planInfo.projects[projectKey].PortfolioBacklogLevelName = null;
            planInfo.projects[projectKey].WorkItemIds = null;
        });

        //  We won't clean up the list of team names, and therefore, neither project names.
        //  Cleaning team names would require running OData queries
        //  to get the latest team for each work item, which is expensive.

        //  Set new schema version.
        planInfo.SchemaVersion = 2;

        PortfolioTelemetry.getInstance().TrackAction("PortfolioPlanning/SchemaUpgrade/Computed", this.VersionUpgrade);

        await PortfolioPlanningDataService.getInstance().UpdatePortfolioPlan(planInfo);

        PortfolioTelemetry.getInstance().TrackAction("PortfolioPlanning/SchemaUpgrade/Completed", this.VersionUpgrade);

        return planInfo;
    }
}
