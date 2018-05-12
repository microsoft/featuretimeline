import { IFeatureTimelineRawState } from "../store";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { UIStatus } from "../types";

export function getTeamIterations(
    projectId: string,
    teamId: string,
    uiStatus: UIStatus,
    rawState: IFeatureTimelineRawState): TeamSettingsIteration[] {

    if (uiStatus !== UIStatus.Default) {
        return [];
    }

    return rawState.iterationState.teamSettingsIterations[projectId][teamId];

}
