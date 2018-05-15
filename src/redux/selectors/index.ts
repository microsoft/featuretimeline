import { IContributionContext } from "../store/common/types";
import { createSelector } from "reselect";
import { getWorkItemsForLevel } from "./workItemsForLevel";
import { getUIStatus } from "./uistatus";
import { IFeatureTimelineRawState } from "../store";
import { WorkItemLevel, StateCategory } from "../store/workitems/types";
import { getWorkItemHierarchy } from "./workItemHierarchySelector";
import { getGridView } from "./gridViewSelector";
import { getTeamIterations } from "./teamIterations";
import { planFeatures } from "./planFeatures";
import { getDefaultPlanFeaturesPaneState } from "../store/common/togglePaneReducer";

export const getRawState = (state: IFeatureTimelineRawState) => state;
export const getProjectId = () => {
    const webContext = VSS.getWebContext();
    return webContext.project.id;
}
export const getTeamId = () => {
    const contributionContext: IContributionContext = VSS.getConfiguration();
    if (contributionContext.team) {
        return contributionContext.team.id;
    }
    const webContext = VSS.getWebContext();
    return webContext.team.id;
};

export const getBacklogLevel = () => {
    const contributionContext: IContributionContext = VSS.getConfiguration();
    return contributionContext.level;
};


export const iterationDisplayOptionsSelector = () => {
    return createSelector(
        [getRawState],
        (state) => {
            if (!state || !state.iterationState) {
                return null;
            }
            return state.iterationState.iterationDisplayOptions;
        });
}

export const workItemIdsSelector = (level: WorkItemLevel, stateCategory: StateCategory) => {
    return createSelector(
        [getProjectId, getTeamId, getRawState],
        (projectId, teamId, state) => {
            if (!state || !state.workItemsState || !state.workItemsState.workItemInfos) {
                return [];
            }
            return getWorkItemsForLevel(state.workItemsState.workItemInfos, level, stateCategory);
        });
}


export const planFeaturesSelector = () => {
    return createSelector(
        [uiStatusSelector(), getProjectId, getTeamId, getRawState],
        (uiStatus, projectId, teamId, state) => {
            return planFeatures(uiStatus, projectId, teamId, state);
        }
    );
}

export const workItemOverrideIterationSelector = () => {
    return createSelector([getRawState], (state) => state.workItemOverrideIteration);
}

export const uiStatusSelector = () => {
    return createSelector([getProjectId, getTeamId, getRawState], getUIStatus);
}

export const planFeatureStateSelector = () => {
    return createSelector([getRawState], (state) => {
        if(!state || !state.planFeaturesState) {
            return getDefaultPlanFeaturesPaneState();
        }

        return state.planFeaturesState;
    })
}

export const workItemHierarchySelector = () => {
    return createSelector([getProjectId, getTeamId, uiStatusSelector(), getRawState], getWorkItemHierarchy);
};

export const teamIterationsSelector = () => {
    return createSelector([getProjectId, getTeamId, uiStatusSelector(), getRawState], getTeamIterations);
}

export const gridViewSelector = () => {
    return createSelector([
        uiStatusSelector(),
        teamIterationsSelector(),
        workItemHierarchySelector(),
        workItemOverrideIterationSelector(),
        iterationDisplayOptionsSelector()
    ],
        getGridView)
}