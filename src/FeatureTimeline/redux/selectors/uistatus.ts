import { IFeatureTimelineRawState } from "../store/types";
import { compareIteration } from "../../../Common/Helpers/iterationComparer";
import { UIStatus } from "../../../Common/types";

export function getUIStatus(
    projectId: string,
    teamId: string,
    rawState: IFeatureTimelineRawState): UIStatus {
    const {
        iterationState
    } = rawState;

    if (rawState.error) {
        return UIStatus.Error;
    }

    if (rawState.loading) {
        return UIStatus.Loading;
    }

    if (!iterationState ||
        !iterationState.teamSettingsIterations ||
        !iterationState.teamSettingsIterations[projectId] ||
        !iterationState.teamSettingsIterations[projectId][teamId] ||
        iterationState.teamSettingsIterations[projectId][teamId].length === 0) {
        return UIStatus.NoTeamIterations;
    }

    const iterations = iterationState.teamSettingsIterations[projectId][teamId].slice();

    iterations.sort(compareIteration);

    if (Object.keys(rawState.workItemsState.workItemInfos).length === 0) {
        return UIStatus.NoWorkItems;
    }


    return UIStatus.Default;
}
