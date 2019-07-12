import { effects, SagaIterator } from "redux-saga";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
import { PlanDirectoryActions, PlanDirectoryActionTypes } from "../Actions/PlanDirectoryActions";
import { ActionsOfType } from "../Helpers";
import {
    PortfolioPlanningDirectory,
    PortfolioPlanningMetadata,
    PortfolioPlanning
} from "../../Models/PortfolioPlanningQueryModels";
import { EpicTimelineActionTypes, EpicTimelineActions } from "../Actions/EpicTimelineActions";
import { getSelectedPlanId } from "../Selectors/PlanDirectorySelectors";
import { getCurrentUser } from "../../Common/Utilities/Identity";
import { getProjectNames, getTeamNames, getExceptionMessage } from "../Selectors/EpicTimelineSelectors";

export function* planDirectorySaga(): SagaIterator {
    yield effects.call(initializePlanDirectory);
    yield effects.takeEvery(PlanDirectoryActionTypes.CreatePlan, createPlan);
    yield effects.takeEvery(PlanDirectoryActionTypes.DeletePlan, deletePlan);
    yield effects.takeEvery(EpicTimelineActionTypes.PortfolioItemsReceived, updateProjectsAndTeamsMetadata);
    yield effects.takeEvery(EpicTimelineActionTypes.PortfolioItemDeleted, updateProjectsAndTeamsMetadata);
}

export function* initializePlanDirectory(): SagaIterator {
    const service = PortfolioPlanningDataService.getInstance();

    const allPlans: PortfolioPlanningDirectory = yield effects.call([service, service.GetAllPortfolioPlans]);

    yield effects.put(PlanDirectoryActions.initialize(allPlans));
}

function* createPlan(action: ActionsOfType<PlanDirectoryActions, PlanDirectoryActionTypes.CreatePlan>) {
    const { name, description } = action.payload;

    const owner = getCurrentUser();
    owner._links = undefined;

    const service = PortfolioPlanningDataService.getInstance();

    try {
        const newPlan: PortfolioPlanning = yield effects.call(
            [service, service.AddPortfolioPlan],
            name,
            description,
            owner
        );
        yield effects.put(PlanDirectoryActions.createPlanSucceeded(newPlan));
        yield effects.put(PlanDirectoryActions.toggleSelectedPlanId(newPlan.id));
        yield effects.put(EpicTimelineActions.toggleIsNewPlanExperience(true));
    } catch (exception) {
        yield effects.put(PlanDirectoryActions.createPlanFailed(exception));
    }
}

function* deletePlan(action: ActionsOfType<PlanDirectoryActions, PlanDirectoryActionTypes.DeletePlan>): SagaIterator {
    const { id } = action.payload;

    const service = PortfolioPlanningDataService.getInstance();

    yield effects.call([service, service.DeletePortfolioPlan], id);
}

function* updateProjectsAndTeamsMetadata(): SagaIterator {
    const exceptionMessage = yield effects.select(getExceptionMessage);

    if (!exceptionMessage) {
        const planId = yield effects.select(getSelectedPlanId);
        const projectNames = yield effects.select(getProjectNames);
        const teamNames = yield effects.select(getTeamNames);

        const service = PortfolioPlanningDataService.getInstance();

        const planToUpdate: PortfolioPlanningMetadata = yield effects.call(
            [service, service.GetPortfolioPlanDirectoryEntry],
            planId
        );

        planToUpdate.projectNames = projectNames;
        planToUpdate.teamNames = teamNames;

        yield effects.call([service, service.UpdatePortfolioPlanDirectoryEntry], planToUpdate);

        yield effects.put(
            PlanDirectoryActions.updateProjectsAndTeamsMetadata(planToUpdate.projectNames, planToUpdate.teamNames)
        );
    }
}
