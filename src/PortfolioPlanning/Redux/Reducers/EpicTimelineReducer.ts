import { IPortfolioPlanningState } from "../Contracts";
import { Projects, Epics } from "../SampleData";
import {
    PortofolioPlanningActions,
    PortfolioPlanningActionTypes
} from "../Actions/EpicTimelineActions";
import produce from "immer";

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

export function getDefaultState(): IPortfolioPlanningState {
    return {
        projects: Projects,
        epics: Epics,
        message: "Initial message"
    };
}
