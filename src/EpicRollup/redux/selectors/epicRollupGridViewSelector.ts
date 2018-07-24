import { IGridView, IWorkItemDisplayDetails, IIterationDisplayOptions, IGridItem, IGridWorkItem } from "../../../Common/Contracts/GridViewContracts";
import { TeamSettingsIteration, BacklogConfiguration } from "TFS/Work/Contracts";
import { getDisplayIterations } from "../../../Common/Selectors/displayIterationSelector";
import { ISettingsState, ProgressTrackingCriteria } from "../../../Common/Contracts/OptionsInterfaces";
import { workItemCompare } from "../../../FeatureTimeline/redux/selectors/workItemCompare";
import { CropWorkItem } from "../../../Common/Contracts/types";
import { getProgress } from "../../../Common/Helpers/ProgressHelpers";
import { getIterationDisplayDetails } from "../../../Common/Helpers/getIterationDisplayDetails";

export interface IAreaPathDisplayItem extends IGridItem {
    teamField: string;
}

export interface IEpicRollupGridView extends IGridView {
    areaPathDisplayItems: IAreaPathDisplayItem[];
}

export function getEpicRollupGridView(
    workItemDisplayDetails: IWorkItemDisplayDetails[],
    backlogIteration: TeamSettingsIteration,
    teamIterations: TeamSettingsIteration[],
    iterationDisplayOptions: IIterationDisplayOptions,
    backlogConfiguration: BacklogConfiguration,
    settingsState: ISettingsState
): IEpicRollupGridView {

    const {
        backlogFields: {
            typeFields
        }
    } = backlogConfiguration;

    const {
        progressTrackingCriteria
    } = settingsState;

    const teamFieldName = typeFields["Team"];

    const displayIterations: TeamSettingsIteration[] = iterationDisplayOptions ? getDisplayIterations(
        backlogIteration,
        teamIterations,
        workItemDisplayDetails,
        /* includeBacklogIteration */ true,
        iterationDisplayOptions) : teamIterations;

    const { gridWorkItems, areaPathDisplayItems } =
        getGridItems(
            workItemDisplayDetails,
            teamFieldName,
            displayIterations,
            iterationDisplayOptions,
            backlogIteration,
            settingsState,
            progressTrackingCriteria);

    const {
        emptyHeaderRow,
        iterationHeader,
        iterationShadow
    } = getIterationDisplayDetails(gridWorkItems, displayIterations, /*hideParents*/ false);

    return {
        workItems: gridWorkItems,
        areaPathDisplayItems,
        isSubGrid: false,
        shadowForWorkItemId: -1,
        hideParents: false,
        iterationDisplayOptions,
        teamIterations,
        backlogIteration,
        iterationHeader,
        iterationShadow,
        emptyHeaderRow
    }

}

function getGridItems(
    workItemDisplayDetails: IWorkItemDisplayDetails[],
    teamFieldName: string,
    displayIterations: TeamSettingsIteration[],
    iterationDisplayOptions: IIterationDisplayOptions,
    backlogIteration: TeamSettingsIteration,
    settingsState: ISettingsState,
    progressTrackingCriteria: ProgressTrackingCriteria): { gridWorkItems: IGridWorkItem[]; areaPathDisplayItems: IAreaPathDisplayItem[]; } {
    const workItemsByTeamField = getWorkItemsByTeamField(workItemDisplayDetails, teamFieldName);
    const sortedTeamFields = Object.keys(workItemsByTeamField).sort();
    const gridWorkItems: IGridWorkItem[] = [];
    const areaPathDisplayItems: IAreaPathDisplayItem[] = [];
    let teamGroupStartRow = 2;
    let teamGroupEndRow = -1;
    sortedTeamFields.forEach(teamField => {
        // create cards for work items, and only if there are more than one card for work items create card for the teamfield
        const orderedWorkItems = workItemsByTeamField[teamField].sort(workItemCompare);
        const workItemStartColumn = 2;
        let workItemStartRow = teamGroupStartRow;
        const childItems = orderedWorkItems.map(workItem => {
            const { iterationDuration: { startIteration, endIteration } } = workItem;
            let startIterationIndex = displayIterations.findIndex(di => di.id === startIteration.id);
            let endIterationIndex = displayIterations.findIndex(di => di.id === endIteration.id);
            let crop: CropWorkItem = CropWorkItem.None;
            let outofScope = false;
            if (iterationDisplayOptions) {
                if (startIterationIndex > iterationDisplayOptions.endIndex || endIterationIndex < iterationDisplayOptions.startIndex) {
                    outofScope = true;
                }
                if (iterationDisplayOptions.startIndex > startIterationIndex) {
                    startIterationIndex = 0;
                    crop = CropWorkItem.Left;
                }
                else {
                    startIterationIndex = displayIterations.findIndex(gi => gi.id === startIteration.id);
                }
                if (endIterationIndex > iterationDisplayOptions.endIndex) {
                    endIterationIndex = displayIterations.length - 1;
                    crop = crop === CropWorkItem.Left ? CropWorkItem.Both : CropWorkItem.Right;
                }
                else {
                    endIterationIndex = displayIterations.findIndex(gi => gi.id === endIteration.id);
                }
            }
            if (outofScope) {
                return null;
            }
            if (startIterationIndex < 0) {
                startIterationIndex = endIterationIndex = displayIterations.findIndex(i => i.id === backlogIteration.id);
            }
            const ret = {
                dimension: {
                    startRow: workItemStartRow,
                    endRow: workItemStartRow + 1,
                    startCol: workItemStartColumn + startIterationIndex,
                    endCol: workItemStartColumn + endIterationIndex
                },
                workItem,
                settingsState,
                isGap: false,
                progressIndicator: getProgress(workItem.children, progressTrackingCriteria),
                crop
            };
            workItemStartRow++;
            return ret;
        }).filter(x => !!x);
        if (childItems.length > 0) {
            gridWorkItems.push(...childItems);
            teamGroupEndRow = teamGroupStartRow + childItems.length;
            areaPathDisplayItems.push({
                dimension: {
                    startRow: teamGroupStartRow,
                    startCol: 1,
                    endRow: teamGroupEndRow,
                    endCol: 2
                },
                teamField
            });
            teamGroupStartRow = teamGroupEndRow;
        }
    });
    return { gridWorkItems, areaPathDisplayItems };
}

function getWorkItemsByTeamField(workItemDisplayDetails: IWorkItemDisplayDetails[], teamFieldName: string): IDictionaryStringTo<IWorkItemDisplayDetails[]> {
    const pathToLeaf = {};
    // get work items by leaf area path
    const workItemsByTeamField: IDictionaryStringTo<IWorkItemDisplayDetails[]> = workItemDisplayDetails.reduce((map, w) => {
        const areaPath: string = w.workItem.fields[teamFieldName];
        const parts = areaPath.split("/");
        let index = parts.length - 1;
        let leafValue = parts[index];
        // to check incase if the leaf value is duplicate, we keep track of entire path
        while (pathToLeaf[leafValue] && pathToLeaf[leafValue] !== areaPath) {
            index--;
            leafValue = `${parts[index]}/${leafValue}`;
        }
        pathToLeaf[leafValue] = areaPath;
        if (!map[leafValue]) {
            map[leafValue] = [];
        }
        map[leafValue].push(w);
        return map;
    }, {});
    return workItemsByTeamField;
}
