import { createStore, Store } from "redux";
import { IPortfolioPlanningState } from "./Contracts";
import {
    portfolioPlanningReducer,
    getDefaultState
} from "./Reducers/EpicTimelineReducer";

export default function configurePortfolioPlanningStore(): Store<
    IPortfolioPlanningState
> {
    const store = createStore(portfolioPlanningReducer, getDefaultState());

    return store;
}
