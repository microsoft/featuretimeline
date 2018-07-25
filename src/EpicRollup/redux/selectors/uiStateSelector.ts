import { createSelector } from "reselect";
import { IEpicRollupState } from "../contracts";
import { UIStatus } from "../../../Common/Contracts/types";
import { teamIterationsSelector } from "../modules/teamIterations/teamIterationSelector";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
export function getEpicRollupState(state: IEpicRollupState) {
    return state;
}
export const uiStateSelector = createSelector(
    getEpicRollupState,
    teamIterationsSelector,
    (state: IEpicRollupState, teamIterations: TeamSettingsIteration[]): UIStatus => {
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