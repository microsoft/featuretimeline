import { ActionsUnion, createAction } from "../../Helpers/ActionHelper";
export const HighlightDependenciesType = "@@PredecessorSuccessor/HighlightDependencies";
export const DismissDependenciesType = "@@PredecessorSuccessor/DismissDependencies";

export interface IHighlightedDependency {
    id: number,
    highlightSuccesors: boolean
}

export interface IHighlightDependenciesAwareState {
    highlightedDependency: IHighlightedDependency
}

export const HighlightDependenciesActionsCreator = {
    highlightDependencies: (id: number, highlightSuccesors: boolean) =>
        createAction(HighlightDependenciesType, { id, highlightSuccesors }),
    dismissDependencies: () =>
        createAction(DismissDependenciesType),
}

type HighlightDependenciesActions = ActionsUnion<typeof HighlightDependenciesActionsCreator>;
export function highlightDependencyReducer(state: IHighlightedDependency, action: HighlightDependenciesActions): IHighlightedDependency {
    if (!state) {
        state = { id: undefined, highlightSuccesors: undefined };
    }
    switch (action.type) {
        case HighlightDependenciesType: {
            return action.payload
        }
        case DismissDependenciesType: {
            return { id: undefined, highlightSuccesors: undefined };
        }
    }

    return state;
}

export const highlightDependenciesSelector = (state: IHighlightDependenciesAwareState) => state.highlightedDependency;