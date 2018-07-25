import {TeamSetting } from "TFS/Work/Contracts";

export type TeamSettingsMap = { [teamId: string]: TeamSetting }

export interface ITeamSettingsAwareState {
    teamSettings: TeamSettingsMap;
}