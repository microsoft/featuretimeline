import { IFeatureTimelineRawState } from "../store";
import { UIStatus } from "../types";
import { IWorkItemListItem } from "../../react/Components/WorkItemList";
import { getWorkItemsForLevel } from "./workItemsForLevel";
import { WorkItemLevel, StateCategory } from "../store/workitems/types";
import { getDefaultInProgressState } from "../helpers/getWorkItemStateCategory";
import { BacklogConfiguration } from "TFS/Work/Contracts";

export function planFeatures(
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
