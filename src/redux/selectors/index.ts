import { IContributionContext } from "../store/common/types";
import { createSelector } from "reselect";
import { getWorkItemsForLevel } from "./workItemsForLevel";
import { getUIStatus } from "./uistatus";
import { IFeatureTimelineRawState } from "../store/types";
import { WorkItemLevel, StateCategory } from "../store/workitems/types";
import { getEpicHierarchy, FeatureFilter } from "./workItemHierarchySelector";
import { getGridView } from "./gridViewSelector";
import { getTeamIterations, getBacklogIteration } from "./teamIterations";
import { getUnplannedFeatures2 } from "./planFeatures";
import { getDefaultPlanFeaturesPaneState } from "../store/common/togglePaneReducer";
import { getDefaultSettingsState } from "../store/common/settingsReducer";

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


export const unplannedFeaturesSelector = () => {
    return createSelector(
        [uiStatusSelector(), getProjectId, getTeamId, getRawState],
        (uiStatus, projectId, teamId, state) => {
            //return getUnplannedFeatures(uiStatus, projectId, teamId, state);
            return getUnplannedFeatures2(projectId, teamId, uiStatus, state);
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
        if (!state || !state.planFeaturesState) {
            return getDefaultPlanFeaturesPaneState();
        }

        return state.planFeaturesState;
    })
}

export const settingsStateSelector = () => {
    return createSelector([getRawState], (state) => {
        if (!state || !state.settingsState) {
            return getDefaultSettingsState();
        }
        return state.settingsState;
    })
}


export const epicsHierarchySelector = () => {
    return createSelector(
        [getProjectId, getTeamId, uiStatusSelector(), getRawState, () => FeatureFilter.WithoutIteration],
        getEpicHierarchy);
};

export const teamIterationsSelector = () => {
    return createSelector([getProjectId, getTeamId, uiStatusSelector(), getRawState], getTeamIterations);
}

export const backlogIterationSelector = () => {
    return createSelector([getProjectId, getTeamId, uiStatusSelector(), getRawState], getBacklogIteration);
}


export const primaryGridViewSelector = () => {
    return createSelector([
        uiStatusSelector(),
        backlogIterationSelector(),
        teamIterationsSelector(),
        epicsHierarchySelector(),
        workItemOverrideIterationSelector(),
        settingsStateSelector(),
        iterationDisplayOptionsSelector()
    ],
        getGridView)
}