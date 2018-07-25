import { IContributionContext, StateCategory } from "../../../Common/redux/Contracts/types";
import { createSelector } from "reselect";
import { getWorkItemsForLevel } from "./workItemsForLevel";
import { getUIStatus } from "./uistatus";
import { IFeatureTimelineRawState } from "../store/types";
import { WorkItemLevel } from "../store/workitems/types";
import { getEpicHierarchy, FeatureFilter } from "./workItemHierarchySelector";
import { getGridView } from "./FeatureTimelineGridViewSelector";
import { getTeamIterations, getBacklogIteration } from "./teamIterations";
import { getUnplannedFeatures2 } from "./planFeatures";
import { getDefaultPlanFeaturesPaneState } from "../store/common/togglePaneReducer";
import { getProjectId, getTeamId } from "../../../Common/redux/Selectors/CommonSelectors";
import { getSettingsState } from "../../../Common/redux/modules/SettingsState/SettingsStateSelector";
import { getWorkItemOverrideIteration } from "../../../Common/redux/modules/OverrideIterations/overriddenIterationsSelector";
import { getIterationDisplayOptionsState } from "../../../Common/redux/modules/IterationDisplayOptions/iterationDisplayOptionsSelector";

export const getRawState = (state: IFeatureTimelineRawState) => state;

export const getBacklogLevel = () => {
    const contributionContext: IContributionContext = VSS.getConfiguration();
    return contributionContext.level;
};

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
        getWorkItemOverrideIteration as any,
        getSettingsState,
        getIterationDisplayOptionsState as any
    ],
        getGridView)
}