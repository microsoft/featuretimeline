import { IIterationDisplayOptionsAwareState } from "../../Common/modules/IterationDisplayOptions/IterationDisplayOptionsContracts";
import { IOverriddenIterationsAwareState } from '../../Common/modules/OverrideIterations/overriddenIterationContracts';
import { IProgressAwareState } from "../../Common/modules/ProgressAwareState/ProgressAwareStateContracts";
import { ISettingsAwareState } from "../../Common/modules/SettingsState/SettingsStateContracts";
import { IProjectBacklogConfigurationAwareState } from "./modules/backlogconfiguration/backlogconfigurationcontracts";
import { ITeamIterationsAwareState } from "./modules/teamIterations/teamIterationsContracts";
import { ITeamSettingsAwareState } from "./modules/teamsettings/teamsettingscontracts";
import { IWorkItemMetadataAwareState } from "./modules/workItemMetadata/workItemMetadataContracts";
import { IEpicRollupWorkItemAwareState } from './modules/workItems/workItemContracts';

export interface IEpicRollupState extends
    IProjectBacklogConfigurationAwareState,
    ITeamIterationsAwareState,
    IOverriddenIterationsAwareState,
    IEpicRollupWorkItemAwareState,
    IWorkItemMetadataAwareState,
    ITeamSettingsAwareState,
    IIterationDisplayOptionsAwareState,
    ISettingsAwareState,
    IProgressAwareState {
}