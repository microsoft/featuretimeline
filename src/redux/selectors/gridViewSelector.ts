import { IWorkItemOverrideIteration } from "../store";
import { IWorkItemHierarchy } from "./workItemHierarchySelector";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { UIStatus, IDimension, CropWorkItem } from "../types";
import { compareIteration } from "../helpers/iterationComparer";
import { IIterationDisplayOptions } from "../store/teamiterations/types";

export interface IGridIteration {
    teamIteration: TeamSettingsIteration;
    dimension: IDimension;
}

export interface IGridWorkItem {
    dimension: IDimension;
    workItem: IWorkItemHierarchy;
    isGap?: boolean;
    crop: CropWorkItem;
    gapColor?: string;
}

export interface IGridView {
    emptyHeaderRow: IDimension[]; //Set of empty elements to place items on top of iteration header
    iterationHeader: IGridIteration[];
    iterationShadow: IGridIteration[];
    workItems: IGridWorkItem[];
    isSubGrid: boolean;
    workItemShadow: number;
    hideParents: boolean;
    iterationDisplayOptions: IIterationDisplayOptions;
    teamIterations: TeamSettingsIteration[];
}

export function getGridView(
    uiStatus: UIStatus,
    teamIterations: TeamSettingsIteration[],
    workItems: IWorkItemHierarchy[],
    workItemOverrideIteration: IWorkItemOverrideIteration,
    iterationDisplayOptions: IIterationDisplayOptions = null,
    isSubGrid: boolean = false
): IGridView {

    if (uiStatus !== UIStatus.Default) {
        return {
            emptyHeaderRow: [],
            iterationHeader: [],
            iterationShadow: [],
            workItems: [],
            isSubGrid,
            workItemShadow: 0,
            hideParents: false,
            iterationDisplayOptions: null,
            teamIterations: []
        }
    }

    const hideParents = isSubGrid || (workItems.length === 1 && workItems[0].id === 0);
    const displayIterations = getDisplayIterations(teamIterations, workItems, iterationDisplayOptions);
    const gridWorkItems = getGridWorkItems(
        teamIterations,
        displayIterations,
        iterationDisplayOptions,
        workItems,
        /* startRow */ 3,
        /* startCol */ 1,
        hideParents);

    let workItemShadow = 0;
    if (workItemOverrideIteration && workItemOverrideIteration.workItemId) {
        workItemShadow = workItemOverrideIteration.workItemId;
    }

    const view: IGridView = {
        emptyHeaderRow: [],
        iterationHeader: [],
        iterationShadow: [],
        workItems: gridWorkItems,
        isSubGrid,
        workItemShadow,
        hideParents,
        iterationDisplayOptions,
        teamIterations
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

        view.emptyHeaderRow.push(emptyRowDimension);

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

        view.iterationHeader.push(gridIteration);

        const shadowDimension: IDimension = {
            startRow: startRow + 2,
            startCol,
            endCol,
            endRow: lastWorkItemRow
        };
        const shadowIteration: IGridIteration = {
            teamIteration,
            dimension: shadowDimension
        }
        view.iterationShadow.push(shadowIteration);
        startCol++;
    });
    return view;
}

export function getDisplayIterations(
    teamIterations: TeamSettingsIteration[],
    workItems: IWorkItemHierarchy[],
    iterationDisplayOptions?: IIterationDisplayOptions): TeamSettingsIteration[] {

    // Sort the input iteration
    teamIterations = teamIterations.slice().sort(compareIteration);

    if (iterationDisplayOptions) {
        return teamIterations.slice(iterationDisplayOptions.startIndex, iterationDisplayOptions.endIndex + 1);
    }

    let firstIteration: TeamSettingsIteration = null;
    let lastIteration: TeamSettingsIteration = null;

    // Get all iterations that come in the range of the workItems
    const calcFirstLastIteration = (workItem: IWorkItemHierarchy) => {
        if (firstIteration === null) {
            firstIteration = workItem.iterationDuration.startIteration;
            lastIteration = workItem.iterationDuration.endIteration;
        } else {
            if (compareIteration(workItem.iterationDuration.startIteration, firstIteration) < 0) {
                firstIteration = workItem.iterationDuration.startIteration;
            }

            if (compareIteration(workItem.iterationDuration.endIteration, lastIteration) > 0) {
                lastIteration = workItem.iterationDuration.endIteration;
            }
        }

        workItem.children.forEach(child => calcFirstLastIteration(child));
    };

    workItems.forEach(child => calcFirstLastIteration(child));

    // Get two to the left and two to the right iterations from teamIterations
    let startIndex = teamIterations.findIndex(i => i.id === firstIteration.id) - 2;
    let endIndex = teamIterations.findIndex(i => i.id === lastIteration.id) + 2;

    startIndex = startIndex < 0 ? 0 : startIndex;
    endIndex = endIndex >= teamIterations.length ? teamIterations.length - 1 : endIndex;

    return teamIterations.slice(startIndex, endIndex + 1);
}

function workItemCompare(w1: IWorkItemHierarchy, w2: IWorkItemHierarchy) {
    if (w1.order === w2.order) {
        return w1.id - w2.id;
    }

    return w1.order - w2.order;
}

export function getGridWorkItems(
    teamIterations: TeamSettingsIteration[],
    displayIterations: TeamSettingsIteration[],
    iterationDisplayOptions: IIterationDisplayOptions,
    workItems: IWorkItemHierarchy[],
    startRow: number,
    startColumn: number,
    hideParents: boolean): IGridWorkItem[] {

    const output: IGridWorkItem[] = [];
    workItems = workItems.sort(workItemCompare);

    let lastColumn = displayIterations.length + 1;
    if (!hideParents) {
        lastColumn++;
    }

    workItems.forEach((parent, index) => {
        const parentStartRow = startRow;
        const parentStartColumn = startColumn;
        let parentEndColumn = parentStartColumn;

        const children = parent.children.sort(workItemCompare);
        const parentEndRow = parentStartRow + parent.children.length + (children.length > 0 ? 1 : 0); // Add additional row for just empty workitem to show gap between

        if (!hideParents) {
            parentEndColumn = parentStartColumn + 1;

            const dimension: IDimension = {
                startRow: parentStartRow,
                startCol: parentStartColumn,
                endRow: parentEndRow,
                endCol: parentEndColumn
            };

            const gridItem: IGridWorkItem = { workItem: parent, dimension, crop: CropWorkItem.None };
            output.push(gridItem);

        }

        let childStartRow = parentStartRow;
        const allIterations = iterationDisplayOptions ? teamIterations : displayIterations;

        children.forEach(child => {
            const childEndRow = childStartRow + 1;
            let startIterationIndex = allIterations.findIndex(gi => gi.id === child.iterationDuration.startIteration.id);
            let endIterationIndex = allIterations.findIndex(gi => gi.id === child.iterationDuration.endIteration.id);

            let crop: CropWorkItem = CropWorkItem.None;
            let outofScope = false;

            // Either drop of set out of scope if the child item iteration is out of scope
            if (iterationDisplayOptions) {

                if (startIterationIndex > iterationDisplayOptions.endIndex || endIterationIndex < iterationDisplayOptions.startIndex) {
                    outofScope = true;
                }

                if (iterationDisplayOptions.startIndex > startIterationIndex) {
                    startIterationIndex = 0;
                    crop = CropWorkItem.Left;
                } else {
                    startIterationIndex = displayIterations.findIndex(gi => gi.id === child.iterationDuration.startIteration.id);
                }

                if (endIterationIndex > iterationDisplayOptions.endIndex) {
                    endIterationIndex = displayIterations.length - 1;
                    crop = crop === CropWorkItem.Left ? CropWorkItem.Both : CropWorkItem.Right;
                } else {
                    endIterationIndex = displayIterations.findIndex(gi => gi.id === child.iterationDuration.endIteration.id);
                }
            }

            if (!outofScope) {
                const childStartColumn = parentEndColumn + startIterationIndex;
                const childEndColumn = parentEndColumn + endIterationIndex + 1;

                const dimension: IDimension = {
                    startRow: childStartRow,
                    startCol: childStartColumn,
                    endRow: childEndRow,
                    endCol: childEndColumn
                };

                const gridItem: IGridWorkItem = { workItem: child, dimension, crop };
                output.push(gridItem);

                childStartRow++;
            }
        });

        if (children.length > 0 && index < (workItems.length - 1)) {

            output.push({
                workItem: <IWorkItemHierarchy>{
                    id: -1,
                    title: "",
                    children: [],
                    shouldShowDetails: false
                },
                dimension: {
                    startRow: parentEndRow - 1,
                    endRow: parentEndRow,
                    startCol: hideParents ? 1 : 2,
                    endCol: lastColumn
                },
                isGap: true,
                gapColor: parent.color,
                crop: CropWorkItem.None
            });
        }

        startRow = parentEndRow;
    });

    return output;
}

