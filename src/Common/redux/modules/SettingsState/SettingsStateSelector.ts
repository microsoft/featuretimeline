import { ISettingsAwareState } from "./SettingsStateContracts";
import { getDefaultSettingsState } from "./SettingsStateReducer";

export function getSettingsState(state: ISettingsAwareState) {
    return state.settingsState || getDefaultSettingsState();
}
