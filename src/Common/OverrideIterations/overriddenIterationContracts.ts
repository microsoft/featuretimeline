export interface IOverriddenIterationsAwareState {
    savedOverriddenIterations: IDictionaryNumberTo<IOverriddenIterationDuration>;
}

export interface IOverriddenIterationDuration {
    startIterationId: string;
    endIterationId: string;
    user: string;
}