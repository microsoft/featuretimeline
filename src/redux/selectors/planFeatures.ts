import { BacklogConfiguration } from "TFS/Work/Contracts";
import { IWorkItemListItem } from "../../react/Components/WorkItemList";
import { getDefaultInProgressState } from "../helpers/getWorkItemStateCategory";
import { IFeatureTimelineRawState, IterationDurationKind } from "../store";
import { StateCategory, WorkItemLevel } from "../store/workitems/types";
import { UIStatus } from "../types";
import { FeatureFilter, getEpicHierarchy } from "./workItemHierarchySelector";
import { getWorkItemsForLevel } from "./workItemsForLevel";

export function getUnplannedFeatures(
    uiStatus: UIStatus,
    projectId: string,
    teamId: string,
    rawState: IFeatureTimelineRawState): IWorkItemListItem[] {

    if (uiStatus !== UIStatus.Default) {
        return [];
    }

    const {
        workItemsState,
        workItemMetadata,
        backlogConfiguration
    } = rawState

    const proposedWorkItems = getWorkItemsForLevel(workItemsState.workItemInfos, WorkItemLevel.Current, StateCategory.Proposed);
    return proposedWorkItems.map((id) => {
        const workItem = workItemsState.workItemInfos[id].workItem;
        const title = workItem.fields["System.Title"];
        const workItemTypeName = workItem.fields["System.WorkItemType"];
        const workItemType = workItemMetadata.metadata[projectId].workItemTypes.filter((wit) => wit.name.toLowerCase() === workItemTypeName.toLowerCase())[0];
        const color = workItemType ? "#" + (workItemType.color.length > 6 ? workItemType.color.substr(2) : workItemType.color) : "#c2c8d1";
        const backlogConfig: BacklogConfiguration = backlogConfiguration.backlogConfigurations[projectId][teamId];
        const inProgressState = getDefaultInProgressState(workItemTypeName, backlogConfig.workItemTypeMappedStates);
        return {
            id: id,
            title,
            color,
            inProgressState
        };
    });
}


export function getUnplannedFeatures2(projectId: string,
    teamId: string,
    uiStatus: UIStatus,
    input: IFeatureTimelineRawState): IWorkItemListItem[] {
    if (uiStatus !== UIStatus.Default) {
        return [];
    }

    const epics = getEpicHierarchy(projectId, teamId, uiStatus, input, FeatureFilter.None)
    const unplannedFeatures = epics.reduce((prev, epic) => {
        if (epic.children) {
            prev.push(...epic.children.filter(c => c.iterationDuration.kind === IterationDurationKind.FallBackToCurrentIteration));
        }
        return prev;
    }, []);


    const {
        workItemsState,
        workItemMetadata,
        backlogConfiguration
    } = input;

    return unplannedFeatures.map(f => {
        const workItem = workItemsState.workItemInfos[f.id].workItem;
        const title = workItem.fields["System.Title"];
        const workItemTypeName = workItem.fields["System.WorkItemType"];
        const workItemType = workItemMetadata.metadata[projectId].workItemTypes.filter((wit) => wit.name.toLowerCase() === workItemTypeName.toLowerCase())[0];
        const color = workItemType ? "#" + (workItemType.color.length > 6 ? workItemType.color.substr(2) : workItemType.color) : "#c2c8d1";
        const backlogConfig: BacklogConfiguration = backlogConfiguration.backlogConfigurations[projectId][teamId];
        const inProgressState = getDefaultInProgressState(workItemTypeName, backlogConfig.workItemTypeMappedStates);
        return {
            id: f.id,
            title,
            color,
            inProgressState
        };
    });
}
