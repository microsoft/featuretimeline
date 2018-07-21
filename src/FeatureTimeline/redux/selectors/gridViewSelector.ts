import { IWorkItemOverrideIteration, ISettingsState, IterationDurationKind, ProgressTrackingCriteria } from "../store/types";
import { IWorkItemHierarchy } from "./workItemHierarchySelector";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { UIStatus, IDimension, CropWorkItem } from "../types";
import { compareIteration } from "../../../Common/iterationComparer";
import { IIterationDisplayOptions } from "../store/teamiterations/types";

export interface IGridIteration {
    teamIteration: TeamSettingsIteration;
    dimension: IDimension;
}
export interface IProgressIndicator {
    total: number;
    completed: number;
}

export interface IGridWorkItem {
    dimension: IDimension;
    workItem: IWorkItemHierarchy;
    progressIndicator: IProgressIndicator;
    crop: CropWorkItem;
    settingsState: ISettingsState;
    gapColor?: string;
    isGap?: boolean;
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
    backlogIteration: TeamSettingsIteration,
}

export function getGridView(
    uiStatus: UIStatus,
    backlogIteration: TeamSettingsIteration,
    teamIterations: TeamSettingsIteration[],
    workItems: IWorkItemHierarchy[],
    workItemOverrideIteration: IWorkItemOverrideIteration,
    settingState: ISettingsState,
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
            teamIterations: [],
            backlogIteration: null
        }
    }

    if (isSubGrid) {
        debugger;
    }

    const hideParents = isSubGrid || (workItems.length === 1 && workItems[0].id === 0);
    const displayIterations = getDisplayIterations(
        backlogIteration,
        teamIterations,
        workItems,
        isSubGrid,
        iterationDisplayOptions);

    const gridWorkItems = getGridWorkItems(
        backlogIteration,
        teamIterations,
        displayIterations,
        iterationDisplayOptions,
        workItems,
        /* startRow */ 3,
        /* startCol */ 1,
        hideParents,
        settingState);

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
        teamIterations,
        backlogIteration
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
    backlogIteration: TeamSettingsIteration,
    teamIterations: TeamSettingsIteration[],
    workItems: IWorkItemHierarchy[],
    isSubGrid: boolean,
    iterationDisplayOptions?: IIterationDisplayOptions): TeamSettingsIteration[] {

    // Sort the input iteration
    teamIterations = teamIterations.slice().sort(compareIteration);

    if (iterationDisplayOptions) {
        return teamIterations.slice(iterationDisplayOptions.startIndex, iterationDisplayOptions.endIndex + 1);
    }


    const hasBacklogIteration = (workItem: IWorkItemHierarchy) => {
        if (!isSubGrid) {
            return false;
        }

        if (workItem.iterationDuration.kind === IterationDurationKind.BacklogIteration) {
            return true;
        }

        return workItem.children.some(child => hasBacklogIteration(child));
    }


    let firstIteration: TeamSettingsIteration = null;
    let lastIteration: TeamSettingsIteration = null;
    let showBacklogIteration = false;

    // Get all iterations that come in the range of the workItems
    const calcFirstLastIteration = (workItem: IWorkItemHierarchy) => {

        // If it is not sub grid and workItem iteration is backlog iteration than ignore it
        if (!isSubGrid && workItem.iterationDuration.kind === IterationDurationKind.BacklogIteration) {
            // Do nothing
        } else {
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
        }
        showBacklogIteration = isSubGrid && (showBacklogIteration || (workItem.iterationDuration.kind === IterationDurationKind.BacklogIteration));

        workItem.children.forEach(child => calcFirstLastIteration(child));
    };

    workItems.forEach(workItem => calcFirstLastIteration(workItem));


    const candidateIterations = [...teamIterations];
    if (showBacklogIteration) {
        candidateIterations.push(backlogIteration);
        candidateIterations.sort(compareIteration);
    }

    // If there are no planned workitems use first and last team iteration
    if (!firstIteration || !lastIteration) {
        firstIteration = candidateIterations[0];
        lastIteration = candidateIterations[candidateIterations.length - 1];
    }

    const additionalIterations = isSubGrid ? 1 : 2;
    // Get two to the left and two to the right iterations from candiateIterations
    let startIndex = candidateIterations.findIndex(i => i.id === firstIteration.id) - additionalIterations;
    let endIndex = candidateIterations.findIndex(i => i.id === lastIteration.id) + additionalIterations;

    startIndex = startIndex < 0 ? 0 : startIndex;
    endIndex = endIndex >= candidateIterations.length ? candidateIterations.length - 1 : endIndex;

    const displayIterations = candidateIterations.slice(startIndex, endIndex + 1);

    return displayIterations;
}

function workItemCompare(w1: IWorkItemHierarchy, w2: IWorkItemHierarchy) {
    if (w1.order === w2.order) {
        return w1.id - w2.id;
    }

    return w1.order - w2.order;
}

export function getGridWorkItems(
    backlogIteration: TeamSettingsIteration,
    teamIterations: TeamSettingsIteration[],
    displayIterations: TeamSettingsIteration[],
    iterationDisplayOptions: IIterationDisplayOptions,
    workItems: IWorkItemHierarchy[],
    startRow: number,
    startColumn: number,
    hideParents: boolean,
    settingsState: ISettingsState): IGridWorkItem[] {

    const {
        progressTrackingCriteria
    } = settingsState;
    const output: IGridWorkItem[] = [];
    workItems = workItems.sort(workItemCompare);

    let lastColumn = displayIterations.length + 1;
    if (!hideParents) {
        lastColumn++;
    }

    workItems.forEach((parent, parentIndex) => {
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

            const gridItem: IGridWorkItem =
            {
                workItem: parent,
                dimension,
                crop: CropWorkItem.None,
                progressIndicator: getProgress(children, progressTrackingCriteria),
                settingsState
            };
            output.push(gridItem); //This can be popped later in this function
        }

        let childStartRow = parentStartRow;
        const allIterations = iterationDisplayOptions ? teamIterations : displayIterations;
        let noChildren = true;
        children.forEach(child => {
            const childEndRow = childStartRow + 1;
            let startIterationIndex = -1;
            let endIterationIndex = -1;

            if (child.iterationDuration.kind !== IterationDurationKind.BacklogIteration) {
                startIterationIndex = allIterations.findIndex(gi => gi.id === child.iterationDuration.startIteration.id);
                endIterationIndex = allIterations.findIndex(gi => gi.id === child.iterationDuration.endIteration.id);
            }

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

                if (startIterationIndex < 0) {
                    startIterationIndex = endIterationIndex = displayIterations.findIndex(i => i.id === backlogIteration.id);
                }
                const childStartColumn = parentEndColumn + startIterationIndex;
                const childEndColumn = parentEndColumn + endIterationIndex + 1;

                const dimension: IDimension = {
                    startRow: childStartRow,
                    startCol: childStartColumn,
                    endRow: childEndRow,
                    endCol: childEndColumn
                };

                const gridItem: IGridWorkItem = {
                    workItem: child, dimension, crop,
                    progressIndicator: getProgress(child.children, progressTrackingCriteria),
                    settingsState
                };
                output.push(gridItem);
                noChildren = false;

                childStartRow++;
            }
        });

        if (noChildren && !hideParents) {
            //If there are no child elements than pop the parent added
            output.pop();
        }
        else {
            // Insert Gap
            if (children.length > 0 && parentIndex < (workItems.length - 1)) {
                output.push({
                    workItem: <IWorkItemHierarchy>{
                        id: -1,
                        title: "",
                        children: [],
                        showInfoIcon: false
                    },
                    dimension: {
                        startRow: parentEndRow - 1,
                        endRow: parentEndRow,
                        startCol: hideParents ? 1 : 2,
                        endCol: lastColumn
                    },
                    isGap: true,
                    gapColor: parent.color,
                    crop: CropWorkItem.None,
                    progressIndicator: null,
                    settingsState
                });
            }

            startRow = parentEndRow;
        }
    });

    return output;
}


function getProgress(children: IWorkItemHierarchy[], criteria: ProgressTrackingCriteria) {
    const completedChildren = children.filter(c => c.isComplete);
    switch (criteria) {
        case ProgressTrackingCriteria.ChildWorkItems: {
            return {
                total: children.length,
                completed: completedChildren.length
            }
        }
        case ProgressTrackingCriteria.EffortsField: {
            return {
                total: getEfforts(children),
                completed: getEfforts(completedChildren)
            }
        }
    }

    return {
        total: 0,
        completed: 0
    }
}

function getEfforts(workItems: IWorkItemHierarchy[]): number {
    return workItems.reduce((prev, w) => prev + w.efforts, 0);
}
