import { IWorkItemDisplayDetails } from "../../../Common/redux/Contracts/GridViewContracts";
export function workItemCompare(w1: IWorkItemDisplayDetails, w2: IWorkItemDisplayDetails) {
    if (w1.order === w2.order) {
        return w1.id - w2.id;
    }
    return w1.order - w2.order;
}