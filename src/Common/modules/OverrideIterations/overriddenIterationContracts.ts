export type SavedOverriddenIteration = IDictionaryNumberTo<IOverriddenIterationDuration>;
export interface IOverriddenIterationsAwareState {
    savedOverriddenIterations: SavedOverriddenIteration;
}

export interface IOverriddenIterationDuration {
    startIterationId: string;
    endIterationId: string;
    user: string;
}


export interface IWorkItemOverrideIteration {
    workItemId: number;
    iterationDuration: IOverriddenIterationDuration;
    changingStart: boolean; // Weather we are changing start iteration or end iteration
}