import { createSelector } from 'reselect';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { IEpicRoadmapState } from '../contracts';

export function getEpicHierarchyLinks(state: IEpicRoadmapState) {
    return state.workItemsState.epicHierarchy;
}

export function getEpicDependenciesLinks(state: IEpicRoadmapState) {
    return state.workItemsState.dependencies;
}

function getPagedWorkItems(state: IEpicRoadmapState) {
    return state.workItemsState.pagedWorkItems;
}

export const pagedWorkItemsMapSelector =
    createSelector(
        getPagedWorkItems,
        (workItems: WorkItem[]) => {
            const map = {};
            if (!workItems) {
                return map;
            }
            workItems.forEach(wit => map[wit.id] = wit);
            return map;
        });

