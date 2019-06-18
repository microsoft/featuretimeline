import { WorkItemTypeStateInfo } from "TFS/Work/Contracts";
import { StateCategory } from "../Contracts/types";

export function getWorkItemStateCategory(
    workItemType: string,
    state: string,
    workItemTypeMappedStates: WorkItemTypeStateInfo[]): StateCategory {

    const stateInfo: WorkItemTypeStateInfo = workItemTypeMappedStates
        .filter(wtms => wtms.workItemTypeName.toLowerCase() === workItemType.toLowerCase())[0];

    const states =Object.keys(stateInfo.states).filter(s => s.toLocaleLowerCase() === state.toLocaleLowerCase());
    if(states.length > 0) {
        return StateCategory[stateInfo.states[states[0]]];
    }
    return StateCategory[stateInfo.states[state]];
}

export function getDefaultInProgressState(
    workItemType: string,
    workItemTypeMappedStates: WorkItemTypeStateInfo[]): string {

    const stateInfo: WorkItemTypeStateInfo = workItemTypeMappedStates
        .filter(wtms => wtms.workItemTypeName.toLowerCase() === workItemType.toLowerCase())[0];


    return Object.keys(stateInfo.states).filter(s => stateInfo.states[s].toLocaleLowerCase() === "InProgress".toLocaleLowerCase())[0];
}
