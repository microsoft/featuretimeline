import { createSelector } from "reselect";
import { getTeamId } from "../../../../Common/Selectors/CommonSelectors";
import { ITeamSettingsAwareState } from "./teamsettingscontracts";

export const getTeamSettingsMap = (state: ITeamSettingsAwareState) => state.teamSettings;

export const teamSettingsSelector =
    createSelector(
        [getTeamSettingsMap, getTeamId],
        (map, teamId) => map[teamId]
    );

export const backogIterationsSelector = createSelector(teamSettingsSelector, (teamSettings) => teamSettings.backlogIteration);