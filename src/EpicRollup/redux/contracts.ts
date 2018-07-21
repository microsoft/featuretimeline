import { IProjectBacklogConfigurationAwareState } from "./modules/backlogconfiguration/backlogconfigurationcontracts";
import { ITeamIterationsAwareState } from "./modules/teamIterations/teamIterationsContracts";
import { IEpicRollupWorkItemAwareState } from './modules/workItems/workItemContracts';
import { IOverriddenIterationsAwareState } from '../../Common/modules/OverrideIterations/overriddenIterationContracts';

export interface IEpicRollupState extends
    IProjectBacklogConfigurationAwareState,
    ITeamIterationsAwareState,
    IOverriddenIterationsAwareState,
    IEpicRollupWorkItemAwareState {

}