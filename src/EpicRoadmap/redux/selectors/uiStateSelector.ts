import { createSelector } from "reselect";
import { IEpicRoadmapState } from "../contracts";
import { UIStatus } from "../../../Common/redux/Contracts/types";
import { teamIterationsSelector } from "../modules/teamIterations/teamIterationSelector";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { getPagedWorkItems } from "./workItemSelector";
import { WorkItem } from "TFS/WorkItemTracking/Contracts";
import { backogIterationsSelector } from "../modules/teamsettings/teamsettingsselector";
export function getEpicRoadmapState(state: IEpicRoadmapState) {
    return state;
}
export const uiStateSelector = createSelector(
    getEpicRoadmapState,
    teamIterationsSelector,
    (state: IEpicRoadmapState, teamIterations: TeamSettingsIteration[]): UIStatus => {
        if (state.progress.loading) {
            return UIStatus.Loading;
        }

        if (state.progress.error) {
            return UIStatus.Error;
        }

        if (!teamIterations || teamIterations.length === 0) {
            return UIStatus.NoTeamIterations;
        }

        if (!state.workItemsState || !state.workItemsState.pagedWorkItems || state.workItemsState.pagedWorkItems.length === 0) {
            return UIStatus.NoWorkItems;
        }

        if (outOfScopeWorkItems(state).length > 0) {
            return UIStatus.OutofScopeTeamIterations;
        }
        return UIStatus.Default;
    }
)

export const outOfScopeWorkItems = createSelector(
    getPagedWorkItems,
    teamIterationsSelector,
    backogIterationsSelector as any,
    (
        workItems: WorkItem[],
        teamIterations: TeamSettingsIteration[],
        backlogIteration: TeamSettingsIteration
    ) => {
        return workItems.filter(w => {
            const iterationPath = w.fields["System.IterationPath"];
            return (backlogIteration.path || backlogIteration.name) !== iterationPath &&
                !teamIterations.some(i => i.path === iterationPath) 
                && w.fields["System.State"] && w.fields["System.State"] !== "Closed";
        });

    });