export interface IProgress {
    error: Error;
    loading: boolean;
}

export interface IProgressAwareState {
    progress: IProgress;
}