import { createSelector } from "reselect";
import { IEpicRoadmapState } from "../contracts";
import { UIStatus } from "../../../Common/redux/Contracts/types";
import { teamIterationsSelector } from "../modules/teamIterations/teamIterationSelector";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
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

        return UIStatus.Default;
    }
)