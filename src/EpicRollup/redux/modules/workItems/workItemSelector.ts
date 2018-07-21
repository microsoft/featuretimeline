import { IEpicRollupWorkItemAwareState } from './workItemContracts';
import { createSelector } from 'reselect';
import { WorkItemLink } from 'TFS/WorkItemTracking/Contracts';
function getEpicHierarchyLinks(state: IEpicRollupWorkItemAwareState) {
    return state.epicHierarchy;
}

function getEpicDependenciesLinks(state: IEpicRollupWorkItemAwareState) {
    return state.dependencies;
}

export interface IEpicTree {
    parentToChildrenMap: IDictionaryNumberTo<number[]>;
    childToParentMap: IDictionaryNumberTo<number>;
}
export const getEpicTree = createSelector([getEpicHierarchyLinks], (links) => {
    // target is child and source is parent
    const epicTree: IEpicTree = {
        parentToChildrenMap: {},
        childToParentMap: {}
    };
    return links.reduce((epicTree, link) => {

        const childId = link.target.id;
        const parentId = link.source.id;
        const {
            childToParentMap,
            parentToChildrenMap
        } = epicTree;
        childToParentMap[childId] = parentId;

        if (!parentToChildrenMap[parentId]) {
            parentToChildrenMap[parentId] = [];
        }
        parentToChildrenMap[parentId].push(childId);

        return epicTree;
    }, epicTree)
});

export interface IDependenciesTree {

    /**
     * Predecessor to Successor
     */
    ptos: IDictionaryNumberTo<number[]>;

    /**
     * Successor to Predecessor
     */
    stop: IDictionaryNumberTo<number[]>;
}

export const getDependeciesTree = createSelector(
    [getEpicTree, getEpicDependenciesLinks],
    (epicTree: IEpicTree, dependencyLinks: WorkItemLink[]) => {
        // Visit bottom up
        // Get direct dependencies
        // Get dependencies of children and then merge
    })