import { IGridView, IWorkItemDisplayDetails, IIterationDisplayOptions, IGridItem, IGridWorkItem } from "../../../Common/Contracts/GridViewContracts";
import { TeamSettingsIteration, BacklogConfiguration } from "TFS/Work/Contracts";
import { getDisplayIterations } from "../../../Common/Selectors/displayIterationSelector";
import { ISettingsState } from "../../../Common/Contracts/OptionsInterfaces";
import { workItemCompare } from "../../../FeatureTimeline/redux/selectors/workItemCompare";

export interface IAreaPathDisplayItem extends IGridItem {
    areaPath: string;
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

    const orderFieldName = typeFields["Order"];
    const effortFieldName = typeFields["Effort"];
    const teamFieldName = typeFields["Team"];

    const displayIterations = getDisplayIterations(
        backlogIteration,
        teamIterations,
        workItemDisplayDetails,
        /* includeBacklogIteration */ true,
        iterationDisplayOptions);

    const workItemsByTeamField = getWorkItemsByTeamField(
        workItemDisplayDetails, 
        teamFieldName);

    const sortedTeamFields = Object.keys(workItemsByTeamField).sort();
    const gridWorkItems: IGridWorkItem[] = [];
    const areaPathDisplayItems: IAreaPathDisplayItem[] = [];
    let teamGroupStartRow = 2;
    sortedTeamFields.forEach(teamField => {
        const workItems = workItemsByTeamField[teamField].sort(workItemCompare);
        

    });

}

function getWorkItemsByTeamField(workItemDisplayDetails: IWorkItemDisplayDetails[], teamFieldName: string) {
    const pathToLeaf = {};
    // get work items by leaf area path
    const workItemsByTeamField = workItemDisplayDetails.reduce((map, w) => {
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
