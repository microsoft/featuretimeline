import { IProjectBacklogConfigurationAwareState } from "./modules/backlogconfiguration/backlogconfigurationcontracts";
import { ITeamIterationsAwareState } from "./modules/teamIterations/teamIterationsContracts";
import { IEpicRollupWorkItemAwareState } from './modules/workItems/workItemContracts';
import { IOverriddenIterationsAwareState } from '../../Common/modules/OverrideIterations/overriddenIterationContracts';
import { IWorkItemMetadataAwareState } from "./modules/workItemMetadata/workItemMetadataContracts";
import { ITeamSettingsAwareState } from "./modules/teamsettings/teamsettingscontracts";
import { IIterationDisplayOptionsAwareState } from "../../Common/modules/IterationDisplayOptions/IterationDisplayOptionsContracts";
import { ISettingsAwareState } from "../../Common/modules/SettingsState/SettingsStateContracts";

export interface IEpicRollupState extends
    IProjectBacklogConfigurationAwareState,
    ITeamIterationsAwareState,
    IOverriddenIterationsAwareState,
    IEpicRollupWorkItemAwareState,
    IWorkItemMetadataAwareState,
    ITeamSettingsAwareState,
    IIterationDisplayOptionsAwareState,
    ISettingsAwareState {
}