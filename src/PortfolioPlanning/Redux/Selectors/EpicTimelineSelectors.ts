import { IPortfolioPlanningState } from "../Contracts";

export function getMessage(state: IPortfolioPlanningState): string {
    return state.message;
}
