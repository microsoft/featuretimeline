import { createSelector } from "reselect";
import { BacklogConfiguration, TeamSettingsIteration } from "TFS/Work/Contracts";
import { WorkItem, WorkItemStateColor } from "TFS/WorkItemTracking/Contracts";
import { IWorkItemDisplayDetails } from "../../../Common/redux/Contracts/GridViewContracts";
import { StateCategory } from "../../../Common/redux/Contracts/types";
import { getWorkItemStateCategory } from "../../../Common/redux/Helpers/getWorkItemStateCategory";
import { backlogConfigurationForProjectSelector } from "../modules/backlogconfiguration/backlogconfigurationselector";
import { teamIterationsSelector } from "../modules/teamIterations/teamIterationSelector";
import { IWorkItemMetadata } from "../modules/workItemMetadata/workItemMetadataContracts";
import { workItemMetadataSelector } from "../modules/workItemMetadata/workItemMetadataSelector";
import { INormalizedDependencyTree } from "../modules/workItems/workItemContracts";
import { normalizedDependencyTreeSelector } from "./dependencyTreeSelector";
import { IEpicTree, normalizedEpicTreeSelector } from "./epicTreeSelector";
import { pagedWorkItemsMapSelector } from "./workItemSelector";
import { WorkItemStartEndIteration, workItemStartEndIterationSelector } from "./workItemStartEndIterationSelector";
import { highlightDependenciesSelector, IHighlightedDependency } from "../../../Common/redux/modules/HighlightDependencies/HighlightDependenciesModule";

export const workItemDisplayDetailsSelectors = rootWorkItemId => createSelector(
    () => rootWorkItemId,
    normalizedEpicTreeSelector,
    normalizedDependencyTreeSelector,
    pagedWorkItemsMapSelector,
    workItemStartEndIterationSelector,
    backlogConfigurationForProjectSelector,
    teamIterationsSelector as any,
    workItemMetadataSelector,
    highlightDependenciesSelector as any,
    getWorkItemDisplayDetails
);
export function getWorkItemDisplayDetails(
    rootWorkItemId: number,
    epicTree: IEpicTree,
    dependencyTree: INormalizedDependencyTree,
    pagedWorkItems: IDictionaryNumberTo<WorkItem>,
    workItemStartEndIterations: WorkItemStartEndIteration,
    backlogConfiguration: BacklogConfiguration,
    teamIterations: TeamSettingsIteration[],
    metadata: IWorkItemMetadata,
    highlightedDependency: IHighlightedDependency): IWorkItemDisplayDetails[] {

    if (!metadata || !metadata.workItemTypes || !metadata.workItemStateColors) {
        return [];
    }

    const workItems = epicTree.parentToChildrenMap[rootWorkItemId] || [];
    return workItems.map(workItemId => {
        const workItem = pagedWorkItems[workItemId];
        const workItemTypeName = workItem.fields["System.WorkItemType"];
        const state = workItem.fields["System.State"].toLowerCase();
        const title = workItem.fields["System.Title"];
        const workItemType = metadata.workItemTypes.filter((wit) => wit.name.toLowerCase() === workItemTypeName.toLowerCase())[0];
        let workItemStateColor: WorkItemStateColor = null;

        if (metadata.workItemStateColors[workItemTypeName]) {
            workItemStateColor = metadata.workItemStateColors[workItemTypeName].filter(sc => sc.name.toLowerCase() === state)[0];
        }

        const orderFieldName = backlogConfiguration.backlogFields.typeFields["Order"];
        const effortFieldName = backlogConfiguration.backlogFields.typeFields["Effort"];
        const color = workItemType && workItemType.color ? "#" + (workItemType.color.length > 6 ? workItemType.color.substr(2) : workItemType.color) : "#c2c8d1";
        const order = workItem.fields[orderFieldName];
        const efforts = workItem.fields[effortFieldName] || 0;
        const iterationDuration = workItemStartEndIterations[workItemId];
        const children = getWorkItemDisplayDetails(
            workItemId,
            epicTree,
            dependencyTree,
            pagedWorkItems,
            workItemStartEndIterations,
            backlogConfiguration,
            teamIterations,
            metadata,
            highlightedDependency);
        const childrenWithNoEfforts = children.filter(c => c.efforts === 0).length;
        const stateCategory = getWorkItemStateCategory(workItemTypeName, state, backlogConfiguration.workItemTypeMappedStates);

        let highlighteSuccessorIcon = false;
        let highlightPredecessorIcon = false;
        if (highlightedDependency.id && highlightedDependency.highlightSuccesors && dependencyTree.allStop[workItem.id]) {
            highlighteSuccessorIcon = dependencyTree.allStop[workItem.id].findIndex(i => i === highlightedDependency.id) !== -1;
        }

        if (highlightedDependency.id && !highlightedDependency.highlightSuccesors && dependencyTree.allPtos[workItem.id]) {
            highlightPredecessorIcon = dependencyTree.allPtos[workItem.id].findIndex(i => i === highlightedDependency.id) !== -1;
        }

        const displayDetails: IWorkItemDisplayDetails = {
            id: workItem.id,
            title,
            color,
            order,
            efforts,
            workItem,
            iterationDuration,
            children,
            isRoot: false,
            workItemStateColor,
            childrenWithNoEfforts,
            isComplete: stateCategory === StateCategory.Completed,
            predecessors: (dependencyTree.allStop[workItem.id] || []).map(i => pagedWorkItems[i]).filter(w => !!w),
            successors: (dependencyTree.allPtos[workItem.id] || []).map(i => pagedWorkItems[i]).filter(w => !!w),
            highlighteSuccessorIcon,
            highlightPredecessorIcon
        };

        return displayDetails;
    });
}