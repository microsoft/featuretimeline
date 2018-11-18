import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
export interface IIterationDuration {
    startIteration: TeamSettingsIteration;
    endIteration: TeamSettingsIteration;
    kind: IterationDurationKind;
    kindMessage: string; // Little more descriptive message to indicate why the specific kin was used
    overridedBy?: string; // User name for the case when kind is UserOverridden
    childrenAreOutofBounds; // Used to show a warning if there are any children that are outside of the bounds of the work item start/end iteration
}

export enum IterationDurationKind {
    BacklogIteration = "BacklogIteration",
    Self = "Self",
    ChildRollup = "ChildRollup",
    UserOverridden = "UserOverridden",
    Predecessors = "Predecessors",
}