import { IGridView, IWorkItemDisplayDetails } from "../../../Common/Contracts/GridViewContracts";
import { IDimension } from "../../../Common/Contracts/types";

export interface IAreaPathDisplayItem {
    areaPath: string;
    dimension: IDimension;
}

export interface IEpicRollupGridView extends IGridView {
    areaPathDisplayItems: IAreaPathDisplayItem[];
}

export function getEpicRollupGridView(
    workItemDisplayDetails: IWorkItemDisplayDetails[]
) {

}