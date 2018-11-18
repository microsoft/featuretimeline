import {TeamSetting } from "azure-devops-extension-api/Work";

export type TeamSettingsMap = { [teamId: string]: TeamSetting }

export interface ITeamSettingsAwareState {
    teamSettings: TeamSettingsMap;
}