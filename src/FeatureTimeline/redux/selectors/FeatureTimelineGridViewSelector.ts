import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { IGridView, IGridWorkItem, IIterationDisplayOptions, IWorkItemDisplayDetails } from "../../../Common/Contracts/GridViewContracts";
import { CropWorkItem, IDimension, UIStatus } from "../../../Common/Contracts/types";
import { getIterationDisplayDetails } from "../../../Common/Helpers/getIterationDisplayDetails";
import { getProgress } from "../../../Common/Helpers/ProgressHelpers";
import { IWorkItemOverrideIteration } from "../../../Common/modules/OverrideIterations/overriddenIterationContracts";
import { ISettingsState } from "../../../Common/modules/SettingsState/SettingsStateContracts";
import { getDisplayIterations } from "../../../Common/Selectors/displayIterationSelector";
import { IterationDurationKind } from "../../../Common/Contracts/IIterationDuration";
import { workItemCompare } from "./workItemCompare";

export function getGridView(
    uiStatus: UIStatus,
    backlogIteration: TeamSettingsIteration,
    teamIterations: TeamSettingsIteration[],
    workItemDisplayDetails: IWorkItemDisplayDetails[],
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
            shadowForWorkItemId: 0,
            hideParents: false,
            iterationDisplayOptions: null,
            teamIterations: [],
            backlogIteration: null
        }
    }

    if (isSubGrid) {
        debugger;
    }

    const displayIterations = getDisplayIterations(
        backlogIteration,
        teamIterations,
        workItemDisplayDetails,
        isSubGrid,
        iterationDisplayOptions);

    const hideParents = isSubGrid || (workItemDisplayDetails.length === 1 && workItemDisplayDetails[0].id === 0);
    const gridWorkItems = getGridWorkItems(
        backlogIteration,
        teamIterations,
        displayIterations,
        iterationDisplayOptions,
        workItemDisplayDetails,
        /* startRow */ 3,
        /* startCol */ 1,
        hideParents,
        settingState);

    let shadowForWorkItemId = 0;
    if (workItemOverrideIteration && workItemOverrideIteration.workItemId) {
        shadowForWorkItemId = workItemOverrideIteration.workItemId;
    }

    const {
        emptyHeaderRow,
        iterationHeader,
        iterationShadow
    } = getIterationDisplayDetails(gridWorkItems, displayIterations, hideParents);

    const view: IGridView = {
        workItems: gridWorkItems,
        isSubGrid,
        shadowForWorkItemId,
        hideParents,
        iterationDisplayOptions,
        teamIterations,
        backlogIteration,
        emptyHeaderRow,
        iterationHeader,
        iterationShadow
    }
    return view;
}

export function getGridWorkItems(
    backlogIteration: TeamSettingsIteration,
    teamIterations: TeamSettingsIteration[],
    displayIterations: TeamSettingsIteration[],
    iterationDisplayOptions: IIterationDisplayOptions,
    workItems: IWorkItemDisplayDetails[],
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
                    workItem: <IWorkItemDisplayDetails>{
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


