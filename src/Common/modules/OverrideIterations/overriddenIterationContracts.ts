export type SavedOverriddenIteration = IDictionaryNumberTo<IOverriddenIterationDuration>;
export interface IOverriddenIterationsAwareState {
    savedOverriddenIterations: SavedOverriddenIteration;
}

export interface IOverriddenIterationDuration {
    startIterationId: string;
    endIterationId: string;
    user: string;
}