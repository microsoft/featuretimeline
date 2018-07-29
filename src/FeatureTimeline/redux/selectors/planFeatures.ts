import { BacklogConfiguration } from "TFS/Work/Contracts";
import { IWorkItemListItem } from "../../../Common/react/Components/WorkItemList";
import { getDefaultInProgressState } from "../../../Common/redux/Helpers/getWorkItemStateCategory";
import { IFeatureTimelineRawState } from "../store/types";
import { IterationDurationKind } from "../../../Common/redux/Contracts/IIterationDuration";
import { FeatureFilter, getEpicHierarchy } from "./workItemHierarchySelector";
import { UIStatus } from "../../../Common/redux/Contracts/types";



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
            prev.push(...epic.children.filter(c => c.iterationDuration.kind === IterationDurationKind.BacklogIteration));
        }
        return prev;
    }, []);


    const {
        workItemsState,
        workItemMetadata,
        backlogConfiguration
    } = input;

    const orderField = backlogConfiguration.backlogConfigurations[projectId][teamId].backlogFields.typeFields["Order"];

    return unplannedFeatures.map(f => {
        const workItem = workItemsState.workItemInfos[f.id].workItem;
        const title = workItem.fields["System.Title"];
        const workItemTypeName = workItem.fields["System.WorkItemType"];
        const workItemType = workItemMetadata[projectId].workItemTypes.filter((wit) => wit.name.toLowerCase() === workItemTypeName.toLowerCase())[0];
        const color = workItemType ? "#" + (workItemType.color.length > 6 ? workItemType.color.substr(2) : workItemType.color) : "#c2c8d1";
        const order = workItem.fields[orderField];
        const backlogConfig: BacklogConfiguration = backlogConfiguration.backlogConfigurations[projectId][teamId];
        const inProgressState = getDefaultInProgressState(workItemTypeName, backlogConfig.workItemTypeMappedStates);
        return {
            id: f.id,
            title,
            color,
            inProgressState,
            order
        };
    })
    .sort((a, b) => a.order - b.order);
}
