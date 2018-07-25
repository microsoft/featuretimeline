import { IIterationDisplayOptionsAwareState } from "../../Common/redux/modules/IterationDisplayOptions/IterationDisplayOptionsContracts";
import { IOverriddenIterationsAwareState, IWorkItemOverrideIterationAwareState } from '../../Common/redux/modules/OverrideIterations/overriddenIterationContracts';
import { IProgressAwareState } from "../../Common/redux/modules/ProgressAwareState/ProgressAwareStateContracts";
import { ISettingsAwareState } from "../../Common/redux/modules/SettingsState/SettingsStateContracts";
import { IProjectBacklogConfigurationAwareState } from "./modules/backlogconfiguration/backlogconfigurationcontracts";
import { ITeamIterationsAwareState } from "./modules/teamIterations/teamIterationsContracts";
import { ITeamSettingsAwareState } from "./modules/teamsettings/teamsettingscontracts";
import { IWorkItemMetadataAwareState } from "./modules/workItemMetadata/workItemMetadataContracts";
import { IEpicRollupWorkItemAwareState } from './modules/workItems/workItemContracts';
import { IShowWorkItemInfoAwareState } from "../../Common/redux/modules/ShowHideDetails/ShowHideDetailsContracts";

export interface IEpicRollupState extends
    IProjectBacklogConfigurationAwareState,
    ITeamIterationsAwareState,
    IOverriddenIterationsAwareState,
    IEpicRollupWorkItemAwareState,
    IWorkItemMetadataAwareState,
    ITeamSettingsAwareState,
    IIterationDisplayOptionsAwareState,
    ISettingsAwareState,
    IProgressAwareState,
    IWorkItemOverrideIterationAwareState,
    IShowWorkItemInfoAwareState {
}