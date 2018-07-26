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
import { IDependenciesTree } from "../modules/workItems/workItemContracts";
import { normalizedDependencyTreeSelector } from "./dependencyTreeSelector";
import { IEpicTree, normalizedEpicTreeSelector } from "./epicTreeSelector";
import { pagedWorkItemsMapSelector } from "./workItemSelector";
import { WorkItemStartEndIteration, workItemStartEndIterationSelector } from "./workItemStartEndIterationSelector";
import { IterationDurationKind } from "../../../Common/redux/Contracts/IIterationDuration";
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
    dependencyTree: IDependenciesTree,
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
        const color = workItemType ? "#" + (workItemType.color.length > 6 ? workItemType.color.substr(2) : workItemType.color) : "#c2c8d1";
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
        if (highlightedDependency.id && highlightedDependency.highlightSuccesors && dependencyTree.stop[workItem.id]) {
            highlighteSuccessorIcon = dependencyTree.stop[workItem.id].findIndex(i => i === highlightedDependency.id) !== -1;
        }

        if (highlightedDependency.id && !highlightedDependency.highlightSuccesors && dependencyTree.ptos[workItem.id]) {
            highlightPredecessorIcon = dependencyTree.ptos[workItem.id].findIndex(i => i === highlightedDependency.id) !== -1;
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
            showInfoIcon: children.length > 0 || iterationDuration.kind === IterationDurationKind.UserOverridden,
            workItemStateColor,
            childrenWithNoEfforts,
            isComplete: stateCategory === StateCategory.Completed,
            predecessors: (dependencyTree.stop[workItem.id] || []).map(i => pagedWorkItems[i]),
            successors: (dependencyTree.ptos[workItem.id] || []).map(i => pagedWorkItems[i]),
            highlighteSuccessorIcon,
            highlightPredecessorIcon
        };

        return displayDetails;
    });
}