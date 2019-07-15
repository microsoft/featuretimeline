import { takeEvery, put } from "redux-saga/effects";
import { SagaIterator, effects } from "redux-saga";
import { EpicTimelineActionTypes, EpicTimelineActions } from "../Actions/EpicTimelineActions";
import { getEpicById, getProjectConfigurationById } from "../Selectors/EpicTimelineSelectors";
import { IEpic, IProjectConfiguration } from "../../Contracts";
import {
    PortfolioPlanningQueryInput,
    PortfolioPlanningFullContentQueryResult,
    MergeType,
    PortfolioPlanning
} from "../../Models/PortfolioPlanningQueryModels";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
import { PlanDirectoryActionTypes, PlanDirectoryActions } from "../Actions/PlanDirectoryActions";
import { LoadPortfolio } from "./LoadPortfolio";
import { ActionsOfType } from "../Helpers";
import { SetDefaultDatesForEpics, saveDatesToServer } from "./DefaultDateUtil";

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
    const epicId = action.payload.epicId;
    yield effects.call(saveDatesToServer, epicId);
}

function* onUpdateEndDate(
    action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.UpdateEndDate>
): SagaIterator {
    const epicId = action.payload.epicId;
    yield effects.call(saveDatesToServer, epicId);
}

function* onShiftEpic(action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.ShiftItem>): SagaIterator {
    const epicId = action.payload.itemId;
    yield effects.call(saveDatesToServer, epicId);
}
function* onAddEpics(action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.AddItems>): SagaIterator {
    const {
        planId,
        projectId,
        itemIdsToAdd: epicsToAdd,
        //  TODO    Once "Add Epic Dialog" uses redux, project configuration will be available in the state,
        //          so there won't be a need to pass these values when adding epics.
        workItemType,
        requirementWorkItemType,
        effortWorkItemFieldRefName
        //  END of TODO
    } = action.payload;

    //  TODO    sanitize input epics ids (unique ids only)

    const portfolioService = PortfolioPlanningDataService.getInstance();
    const projectIdLowerCase = projectId.toLowerCase();

    //  Check if we have project configuration information from this project already.
    let projectConfig: IProjectConfiguration = yield effects.select(getProjectConfigurationById, projectIdLowerCase);

    if (!projectConfig) {
        //  Find out OData column name for this project. We don't have the project config in the state, which means
        //  this is the first time we see this project.
        const effortODataColumnName = yield effects.call(
            [portfolioService, portfolioService.getODataColumnNameFromWorkItemFieldReferenceName],
            effortWorkItemFieldRefName
        );

        projectConfig = {
            id: projectIdLowerCase,
            defaultEpicWorkItemType: workItemType,
            defaultRequirementWorkItemType: requirementWorkItemType,
            effortWorkItemFieldRefName: effortWorkItemFieldRefName,
            effortODataColumnName: effortODataColumnName
        };
    }

    //  Updating plan data first.
    const storedPlan: PortfolioPlanning = yield effects.call(
        [portfolioService, portfolioService.GetPortfolioPlanById],
        planId
    );

    if (!storedPlan.projects[projectIdLowerCase]) {
        storedPlan.projects[projectIdLowerCase] = {
            ProjectId: projectConfig.id,
            PortfolioWorkItemType: projectConfig.defaultEpicWorkItemType,
            RequirementWorkItemType: projectConfig.defaultRequirementWorkItemType,
            EffortWorkItemFieldRefName: projectConfig.effortWorkItemFieldRefName,
            EffortODataColumnName: projectConfig.effortODataColumnName,
            WorkItemIds: epicsToAdd
        };
    } else {
        //  TODO    Check work item ids are not duplicated.
        storedPlan.projects[projectIdLowerCase].WorkItemIds.push(...epicsToAdd);
    }

    //  Save plan with new epics added.
    yield effects.call([portfolioService, portfolioService.UpdatePortfolioPlan], storedPlan);

    const portfolioQueryInput: PortfolioPlanningQueryInput = {
        WorkItems: [
            {
                projectId: projectId,
                WorkItemTypeFilter: projectConfig.defaultEpicWorkItemType,
                DescendantsWorkItemTypeFilter: projectConfig.defaultRequirementWorkItemType,
                EffortWorkItemFieldRefName: projectConfig.effortWorkItemFieldRefName,
                EffortODataColumnName: projectConfig.effortODataColumnName,
                workItemIds: epicsToAdd
            }
        ]
    };

    const queryResult: PortfolioPlanningFullContentQueryResult = yield effects.call(
        [portfolioService, portfolioService.loadPortfolioContent],
        portfolioQueryInput
    );

    yield effects.call(SetDefaultDatesForEpics, queryResult);

    //  Add new epics selected by customer to existing ones in the plan.
    queryResult.mergeStrategy = MergeType.Add;

    yield put(EpicTimelineActions.portfolioItemsReceived(queryResult));
}

function* onRemoveEpic(action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.RemoveItems>): SagaIterator {
    const { planId, itemIdToRemove } = action.payload;

    const epic: IEpic = yield effects.select(getEpicById, itemIdToRemove);

    const portfolioService = PortfolioPlanningDataService.getInstance();
    const projectIdLowerCase = epic.project.toLowerCase();

    const storedPlan: PortfolioPlanning = yield effects.call(
        [portfolioService, portfolioService.GetPortfolioPlanById],
        planId
    );

    if (storedPlan.projects[projectIdLowerCase]) {
        const updatedEpics = storedPlan.projects[projectIdLowerCase].WorkItemIds.filter(
            current => current !== itemIdToRemove
        );

        if (updatedEpics.length > 0) {
            storedPlan.projects[projectIdLowerCase].WorkItemIds = updatedEpics;
        } else {
            delete storedPlan.projects[projectIdLowerCase];
        }

        //  Save plan with epic removed.
        yield effects.call([portfolioService, portfolioService.UpdatePortfolioPlan], storedPlan);
    }

    yield put(EpicTimelineActions.portfolioItemDeleted(action.payload));
}

function* onToggleSelectedPlanId(
    action: ActionsOfType<PlanDirectoryActions, PlanDirectoryActionTypes.ToggleSelectedPlanId>
): SagaIterator {
    const selectedPlanId = action.payload.id;

    if (selectedPlanId) {
        //  Only load portfolio when a valid plan id was provided.
        yield effects.call(LoadPortfolio, selectedPlanId);
    }
}
