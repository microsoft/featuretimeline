import { TeamSettingsIteration } from 'TFS/Work/Contracts';
export interface IIterationDuration {
    startIteration: TeamSettingsIteration;
    endIteration: TeamSettingsIteration;
    kind: IterationDurationKind;
    overridedBy?: string; // User name for the case when kind is UserOverridden
    childrenAreOutofBounds?: boolean; // Indicates if the child work items has iterations that are out of bounds
}
export enum IterationDurationKind {
    FallbackBacklogIteration_IterationOutOfScope, // The work item is no in backlog iteration but it is used as fallback
    BacklogIteration,
    Self,
    ChildRollup,
    UserOverridden,
    Predecessors,
    FallbackBacklogIteration_PredecessorsOutofScope //Usually happens if team does not subscribe to any iteration beyond last iteration of predessors
}