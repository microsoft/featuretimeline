import { WorkItemTypeStateInfo } from "TFS/Work/Contracts";
import { StateCategory } from "../store/workitems/types";

export function getWorkItemStateCategory(
    workItemType: string,
    state: string,
    workItemTypeMappedStates: WorkItemTypeStateInfo[]): StateCategory {

    const stateInfo: WorkItemTypeStateInfo = workItemTypeMappedStates
        .filter(wtms => wtms.workItemTypeName.toLowerCase() === workItemType.toLowerCase())[0];

    return StateCategory[stateInfo.states[state]];
}