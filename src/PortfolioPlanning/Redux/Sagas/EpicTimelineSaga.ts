import { takeEvery, put } from "redux-saga/effects";
import { SagaIterator, effects } from "redux-saga";
import { EpicTimelineActionTypes, EpicTimelineActions } from "../Actions/EpicTimelineActions";
import { getWorkItemById } from "../Selectors/EpicTimelineSelectors";
import { IWorkItem, LoadingStatus } from "../../Contracts";
import {
    PortfolioPlanningQueryInput,
    PortfolioPlanningFullContentQueryResult,
    MergeType,
    PortfolioPlanning,
    PortfolioItem,
    WorkItemType,
    ProjectPortfolioPlanning
} from "../../Models/PortfolioPlanningQueryModels";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
import { PlanDirectoryActionTypes, PlanDirectoryActions } from "../Actions/PlanDirectoryActions";
import { LoadPortfolio } from "./LoadPortfolio";
import { ActionsOfType } from "../Helpers";
import { SetDefaultDatesForWorkItems, saveDatesToServer } from "./DefaultDateUtil";

export function* epicTimelineSaga(): SagaIterator {
    yield takeEvery(EpicTimelineActionTypes.UpdateStartDate, onUpdateStartDate);
    yield takeEvery(EpicTimelineActionTypes.UpdateEndDate, onUpdateEndDate);
    yield takeEvery(EpicTimelineActionTypes.ShiftItem, onShiftEpic);
    yield takeEvery(EpicTimelineActionTypes.AddItems, onAddEpics);
    yield takeEvery(PlanDirectoryActionTypes.ToggleSelectedPlanId, onToggleSelectedPlanId);
    yield takeEvery(EpicTimelineActionTypes.RemoveItems, onRemoveEpic);
}

function* onUpdateStartDate(
    action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.UpdateStartDate>
): SagaIterator {
    try {
        const epicId = action.payload.epicId;
        yield effects.call(saveDatesToServer, epicId);
    } catch (exception) {
        console.error(exception);
        yield effects.put(EpicTimelineActions.handleGeneralException(exception));
    }
}

function* onUpdateEndDate(
    action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.UpdateEndDate>
): SagaIterator {
    try {
        const epicId = action.payload.epicId;
        yield effects.call(saveDatesToServer, epicId);
    } catch (exception) {
        console.error(exception);
        yield effects.put(EpicTimelineActions.handleGeneralException(exception));
    }
}

function* onShiftEpic(action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.ShiftItem>): SagaIterator {
    try {
        const epicId = action.payload.itemId;
        yield effects.call(saveDatesToServer, epicId);
    } catch (exception) {
        console.error(exception);
        yield effects.put(EpicTimelineActions.handleGeneralException(exception));
    }
}
function* onAddEpics(action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.AddItems>): SagaIterator {
    try {
        yield effects.put(EpicTimelineActions.toggleLoadingStatus(LoadingStatus.NotLoaded));

        const { planId, projectId, items, projectConfiguration } = action.payload;

        const portfolioService = PortfolioPlanningDataService.getInstance();
        const projectIdLowerCase = projectId.toLowerCase();
        const addedWorkItemIds: number[] = [];

        //  Updating plan data first.
        const storedPlan: PortfolioPlanning = yield effects.call(
            [portfolioService, portfolioService.GetPortfolioPlanById],
            planId
        );

        //  When this saga is called, the portfolio plan has already been loaded by loadPortfolioContent saga,
        //  which has already updated the plan's storage to the latest version.

        let existingProjectData = storedPlan.projects[projectIdLowerCase];
        let updatedItems: { [workItemId: number]: PortfolioItem } = {};
        let updatedWorkItemTypeData: { [workItemTypeKey: string]: WorkItemType } = {};

        if (existingProjectData) {
            //  Existing project. Need to add new items, and potentially new work item type data.
            //  Just in case, initializing them if they are undefined.
            updatedItems = existingProjectData.Items || {};
            updatedWorkItemTypeData = existingProjectData.WorkItemTypeData || {};
        }

        //  Adding new items.
        items.forEach(item => {
            const workItemTypeKey = item.workItemType.toLowerCase();

            updatedItems[item.id] = {
                workItemId: item.id,
                workItemType: item.workItemType
            };

            //  Remember which work item ids were added in the this saga execution.
            //  These will be used to run the OData query.
            addedWorkItemIds.push(item.id);

            if (!updatedWorkItemTypeData[workItemTypeKey]) {
                const backlogLevelName = projectConfiguration.backlogLevelNamesByWorkItemType[workItemTypeKey];
                const iconProps = projectConfiguration.iconInfoByWorkItemType[workItemTypeKey];

                updatedWorkItemTypeData[workItemTypeKey] = {
                    workItemType: item.workItemType,
                    backlogLevelName: backlogLevelName,
                    iconProps
                };
            }
        });

        const updatedProjectData: ProjectPortfolioPlanning = {
            ProjectId: projectConfiguration.id,
            RequirementWorkItemType: projectConfiguration.defaultRequirementWorkItemType,
            EffortWorkItemFieldRefName: projectConfiguration.effortWorkItemFieldRefName,
            EffortODataColumnName: projectConfiguration.effortODataColumnName,

            /**
             * Added in V2
             */
            Items: updatedItems,
            WorkItemTypeData: updatedWorkItemTypeData
        };

        storedPlan.projects[projectIdLowerCase] = updatedProjectData;

        //  Save plan with new items added and / or updated project configuration.
        yield effects.call([portfolioService, portfolioService.UpdatePortfolioPlan], storedPlan);

        //  Run query now to get data for new items.
        const portfolioQueryInput: PortfolioPlanningQueryInput = {
            WorkItems: [
                {
                    projectId: projectId,
                    DescendantsWorkItemTypeFilter: projectConfiguration.defaultRequirementWorkItemType,
                    EffortWorkItemFieldRefName: projectConfiguration.effortWorkItemFieldRefName,
                    EffortODataColumnName: projectConfiguration.effortODataColumnName,
                    workItemIds: addedWorkItemIds
                }
            ]
        };

        const queryResult: PortfolioPlanningFullContentQueryResult = yield effects.call(
            [portfolioService, portfolioService.loadPortfolioContent],
            portfolioQueryInput
        );

        yield effects.call(SetDefaultDatesForWorkItems, queryResult);

        //  Add new epics selected by customer to existing ones in the plan.
        queryResult.mergeStrategy = MergeType.Add;

        yield put(
            EpicTimelineActions.portfolioItemsReceived(queryResult, { [projectIdLowerCase]: projectConfiguration })
        );
    } catch (exception) {
        console.error(exception);
        yield effects.put(EpicTimelineActions.handleGeneralException(exception));
    }
}

function* onRemoveEpic(action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.RemoveItems>): SagaIterator {
    try {
        const { planId, itemIdToRemove } = action.payload;

        const epic: IWorkItem = yield effects.select(getWorkItemById, itemIdToRemove);

        const portfolioService = PortfolioPlanningDataService.getInstance();
        const projectIdLowerCase = epic.project.toLowerCase();

        const storedPlan: PortfolioPlanning = yield effects.call(
            [portfolioService, portfolioService.GetPortfolioPlanById],
            planId
        );

        if (storedPlan.projects[projectIdLowerCase]) {
            delete storedPlan.projects[projectIdLowerCase].Items[itemIdToRemove];

            //  NOTE: Not cleaning work item type data on purpose.

            //  Remove project data if no other work items present.
            if (Object.keys(storedPlan.projects[projectIdLowerCase].Items).length === 0) {
                delete storedPlan.projects[projectIdLowerCase];
            }

            //  Save plan with work item removed.
            yield effects.call([portfolioService, portfolioService.UpdatePortfolioPlan], storedPlan);
        }

        yield put(EpicTimelineActions.portfolioItemDeleted(action.payload));
    } catch (exception) {
        console.error(exception);
        yield effects.put(EpicTimelineActions.handleGeneralException(exception));
    }
}

function* onToggleSelectedPlanId(
    action: ActionsOfType<PlanDirectoryActions, PlanDirectoryActionTypes.ToggleSelectedPlanId>
): SagaIterator {
    try {
        const selectedPlanId = action.payload.id;

        if (selectedPlanId) {
            //  Only load portfolio when a valid plan id was provided.
            yield effects.call(LoadPortfolio, selectedPlanId);
        }
    } catch (exception) {
        console.error(exception);
        yield effects.put(EpicTimelineActions.handleGeneralException(exception));
    }
}
