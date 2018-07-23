import { createSelector } from 'reselect';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { IEpicRollupState } from '../contracts';

export function getEpicHierarchyLinks(state: IEpicRollupState) {
    return state.workItemsState.epicHierarchy;
}

export function getEpicDependenciesLinks(state: IEpicRollupState) {
    return state.workItemsState.dependencies;
}

function getPagedWorkItems(state: IEpicRollupState) {
    return state.workItemsState.pagedWorkItems;
}

export const pagedWorkItemsMapSelector =
    createSelector(
        getPagedWorkItems,
        (workItems: WorkItem[]) => {
            const map = {};
            workItems.forEach(wit => map[wit.id] = wit);
            return map;
        });

