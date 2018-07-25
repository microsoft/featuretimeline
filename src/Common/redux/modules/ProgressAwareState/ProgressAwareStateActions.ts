import { ActionsUnion, createAction } from "../../Helpers/ActionHelper";
export const ProgressAwareErrorType = "@@ProgressAware/Error";
export const ProgressAwareLoadingType = "@@ProgressAware/Loading";

export const ProgressAwareActionCreator = {
    setError: (error: Error) =>
        createAction(ProgressAwareErrorType, error),
    setLoading: (loading: boolean) =>
        createAction(ProgressAwareLoadingType, loading)
}

export type ProgressAwareActions = ActionsUnion<typeof ProgressAwareActionCreator>;