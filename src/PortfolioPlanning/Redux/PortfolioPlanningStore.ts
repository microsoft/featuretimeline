import { createStore, Store, combineReducers, Action, Reducer } from "redux";
import { IPortfolioPlanningState } from "./Contracts";
import { epicTimelineReducer } from "./Reducers/EpicTimelineReducer";

// setup reducers
const combinedReducers = combineReducers<IPortfolioPlanningState>({
    epicTimelineState: epicTimelineReducer
});

const reducers: Reducer<IPortfolioPlanningState> = (
    state: IPortfolioPlanningState,
    action: Action
) => {
    return combinedReducers(state, action);
};

export default function configurePortfolioPlanningStore(
    initialState: IPortfolioPlanningState
): Store<IPortfolioPlanningState> {
    const store = createStore(reducers, initialState);

    return store;
}
