import { createStore, Store } from "redux";
import {
    createAction,
    ActionsUnion
} from "../../Common/redux/Helpers/ActionHelper";
import produce from "immer";
import { IProject, IEpic } from "../Contracts";
import { Projects, Epics } from "./SampleData";

// Contracts
export interface IPortfolioPlanningState {
    projects: IProject[];
    epics: IEpic[];
    message: string;
}

function getDefaultState(): IPortfolioPlanningState {
    return {
        projects: Projects,
        epics: Epics,
        message: "Initial message"
    };
}

// Store
export default function configurePortfolioPlanningStore(): Store<
// initialState: IPortfolioPlanningState
    IPortfolioPlanningState
> {
    // const store = createStore(portfolioPlanningReducer, initialState);
    const store = createStore(portfolioPlanningReducer, getDefaultState());

    return store;
}

// Actions
export const enum PortfolioPlanningActionTypes {
    UpdateMessage = "PortfolioPlanning/UpdateMessage"
}

export const PortfolioPlanningActions = {
    updateMessage: (message: string) =>
        createAction(PortfolioPlanningActionTypes.UpdateMessage, {
            message
        })
};

export type PortofolioPlanningActions = ActionsUnion<
    typeof PortfolioPlanningActions
>;

// Reducer
export function portfolioPlanningReducer(
    state: IPortfolioPlanningState,
    action: PortofolioPlanningActions
): IPortfolioPlanningState {
    return produce(
        state || getDefaultState(),
        (draft: IPortfolioPlanningState) => {
            switch (action.type) {
                case PortfolioPlanningActionTypes.UpdateMessage: {
                    draft.message = action.payload.message;

                    break;
                }
            }
        }
    );
}

// Selectors
export function getMessage(state: IPortfolioPlanningState): string {
    return state.message;
}
