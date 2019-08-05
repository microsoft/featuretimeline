export interface IProgress {
    error: Error;
    loading: boolean;
    basicProcessError: Error;
}

export interface IProgressAwareState {
    progress: IProgress;
}