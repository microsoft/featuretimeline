import { TeamSettingsMap } from "./teamsettingscontracts";
import produce from "immer";
import { TeamSettingsActions, TeamSettingsReceivedType } from "./teamsettingsactions";

export function teamSettingsReducer(state: TeamSettingsMap, action: TeamSettingsActions): TeamSettingsMap {
    if(!state) {
        state = {};
    }
    return produce(state, draft => {
        const {
            payload
        } = action;
        switch (action.type) {
            case TeamSettingsReceivedType:
                {
                    const {
                        teamId,
                        teamSettings
                    } = payload;
                    draft[teamId] = teamSettings;
                }
        }
    });
}