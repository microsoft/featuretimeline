import { createSelector } from 'reselect';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { IEpicRollupState } from '../contracts';

export function getEpicHierarchyLinks(state: IEpicRollupState) {
    return state.epicHierarchy;
}

export function getEpicDependenciesLinks(state: IEpicRollupState) {
    return state.dependencies;
}

function getPagedWorkItems(state: IEpicRollupState) {
    return state.pagedWorkItems;
}

export const pagedWorkItemsMapSelector =
    createSelector(
        getPagedWorkItems,
        (workItems: WorkItem[]) => {
            const map = {};
            workItems.forEach(wit => map[wit.id] = wit);
            return map;
        });

