import { IProjectBacklogConfigurationAwareState } from "./modules/backlogconfiguration/backlogconfigurationcontracts";
import { ITeamIterationsAwareState } from "./modules/teamIterations/teamIterationsContracts";
import { IEpicRollupWorkItemAwareState } from './modules/workItems/workItemContracts';
import { IOverriddenIterationsAwareState } from '../../Common/modules/OverrideIterations/overriddenIterationContracts';
import { IWorkItemMetadataAwareState } from "./modules/workItemMetadata/workItemMetadataContracts";

export interface IEpicRollupState extends
    IProjectBacklogConfigurationAwareState,
    ITeamIterationsAwareState,
    IOverriddenIterationsAwareState,
    IEpicRollupWorkItemAwareState,
    IWorkItemMetadataAwareState {
}