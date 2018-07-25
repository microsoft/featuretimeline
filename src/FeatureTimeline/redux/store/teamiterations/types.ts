import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { IIterationDisplayOptionsAwareState } from "../../../../Common/redux/modules/IterationDisplayOptions/IterationDisplayOptionsContracts";

export interface ITeamSettingsIterationState {
    // project -> team -> Backlog Configuration
    teamSettingsIterations: IDictionaryStringTo<IDictionaryStringTo<TeamSettingsIteration[]>>;
}