import { IWorkItemDisplayDetails } from "../../../Common/Contracts/GridViewContracts";
import { IEpicTree } from "./epicTreeSelector";
import { IDependenciesTree } from "../modules/workItems/workItemContracts";
import { IWorkItemMetadata } from "../modules/workItemMetadata/workItemMetadataContracts";
import { WorkItem, WorkItemStateColor } from "TFS/WorkItemTracking/Contracts";
import { WorkItemStartEndIteration } from "./workItemStartEndIterationSelector";
import { BacklogConfiguration, TeamSettingsIteration } from "TFS/Work/Contracts";
import { getWorkItemStateCategory } from "../../../Common/Helpers/getWorkItemStateCategory";
import { StateCategory } from "../../../FeatureTimeline/redux/store/workitems/types";

export function getWorkItemDisplayDetails(
    rootWorkItemId: number,
    epicTree: IEpicTree,
    dependencyTree: IDependenciesTree,
    pagedWorkItems: IDictionaryNumberTo<WorkItem>,
    workItemStartEndIterations: WorkItemStartEndIteration,
    backlogConfiguration: BacklogConfiguration,
    teamIterations: TeamSettingsIteration[],
    metadata: IWorkItemMetadata): IWorkItemDisplayDetails[] {

    const workItems = epicTree.parentToChildrenMap[rootWorkItemId];
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
            metadata);
        const childrenWithNoEfforts = children.filter(c => c.efforts === 0).length;
        const stateCategory = getWorkItemStateCategory(workItemTypeName, state, backlogConfiguration.workItemTypeMappedStates);

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
            showInfoIcon: true,
            workItemStateColor,
            childrenWithNoEfforts,
            isComplete: stateCategory === StateCategory.Completed
        };

        return displayDetails;
    });
}