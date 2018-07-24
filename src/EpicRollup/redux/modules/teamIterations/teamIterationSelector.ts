import { createSelector } from "reselect";
import { getTeamId } from '../../../../Common/Selectors/CommonSelectors';
import { IEpicRollupState } from '../../contracts';

export const getTeamIterationsMap = (state: IEpicRollupState) => state.teamIterations;

export const teamIterationsSelector = createSelector(
    [getTeamIterationsMap, getTeamId],
    (map, teamId) => map[teamId]
);