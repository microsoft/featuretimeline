import { createSelector } from "reselect";
import { getTeamId } from '../../../../Common/Selectors/CommonSelectors';
import { ITeamIterationsAwareState } from "./teamIterationsContracts";

export const getTeamIterationsMap = (state: ITeamIterationsAwareState) => state.teamIterations;

export const teamIterationsSelector = createSelector(
    [getTeamIterationsMap, getTeamId],
    (map, teamId) => map[teamId]
);