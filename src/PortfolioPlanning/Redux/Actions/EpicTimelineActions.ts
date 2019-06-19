import {
    createAction,
    ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";

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
