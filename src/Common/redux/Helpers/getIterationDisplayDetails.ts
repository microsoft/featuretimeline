import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { IGridIteration, IGridIterationDisplayDetails, IGridWorkItem } from "../Contracts/GridViewContracts";
import { IDimension } from "../Contracts/types";

export function getIterationDisplayDetails(gridWorkItems: IGridWorkItem[], displayIterations: TeamSettingsIteration[], hideParents: boolean) {
    const gridIterationDisplayDetails: IGridIterationDisplayDetails = {
        emptyHeaderRow: [],
        iterationHeader: [],
        iterationShadow: []
    };
    // Calculate shadow and header
    const startRow = 1;
    const endRow = 2;
    const lastWorkItemRow = gridWorkItems.length > 0 ? gridWorkItems[gridWorkItems.length - 1].dimension.endRow + 1 : endRow + 1;
    let startCol = hideParents ? 1 : 2; // First column is for the epic
    displayIterations.forEach(teamIteration => {
        const endCol = startCol + 1;
        const emptyRowDimension: IDimension = {
            startCol,
            startRow,
            endRow,
            endCol
        };
        gridIterationDisplayDetails.emptyHeaderRow.push(emptyRowDimension);
        const dimension: IDimension = {
            startCol,
            startRow: startRow + 1,
            endRow,
            endCol
        };
        const gridIteration: IGridIteration = {
            teamIteration,
            dimension
        };
        gridIterationDisplayDetails.iterationHeader.push(gridIteration);
        const shadowDimension: IDimension = {
            startRow: startRow + 2,
            startCol,
            endCol,
            endRow: lastWorkItemRow
        };
        const shadowIteration: IGridIteration = {
            teamIteration,
            dimension: shadowDimension
        };
        gridIterationDisplayDetails.iterationShadow.push(shadowIteration);
        startCol++;
    });
    return gridIterationDisplayDetails;
}