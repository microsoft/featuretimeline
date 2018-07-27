import { createSelector } from 'reselect';
import { IDependenciesTree } from '../modules/workItems/workItemContracts';
import { WorkItemLink, WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { getEpicDependenciesLinks } from './workItemSelector';
import { normalizedEpicTreeSelector, IEpicTree } from './epicTreeSelector';
import { outOfScopeWorkItems } from './uiStateSelector';

const rawDependencyTreeSelector = createSelector(
    getEpicDependenciesLinks,
    outOfScopeWorkItems,
    createRawDependencyTree);
export function createRawDependencyTree(
    links: WorkItemLink[],
    outOfScopeWorkItems: WorkItem[]) {
    links = links || [];
    const result: IDependenciesTree = {
        ptos: {},
        stop: {}
    };

    const outOfScopeWorkItemsSet = new Set();
    outOfScopeWorkItems.forEach(w => outOfScopeWorkItemsSet.add(w.id));

    // Source is successor target is predecessor
    links.forEach(link => {
        const successor = link.source ? link.source.id : 0;
        const predecessor = link.target ? link.target.id : 0;
        if (!outOfScopeWorkItemsSet.has(successor) && !outOfScopeWorkItemsSet.has(predecessor)) {
            if (!result.ptos[predecessor]) {
                result.ptos[predecessor] = [];
            }
            if (!result.stop[successor]) {
                result.stop[successor] = [];
            }
            result.ptos[predecessor].push(successor);
            result.stop[successor].push(predecessor);
        }
    });

    return result;
}

/**
 * Normalizes the dependency tree where the parents relation ships are created due to children
 */
export const normalizedDependencyTreeSelector = createSelector(normalizedEpicTreeSelector, rawDependencyTreeSelector as any, createNormalizedDependencyTree);
export function createNormalizedDependencyTree(
    epicTree: IEpicTree,
    dependencyTree: IDependenciesTree) {
    const result: IDependenciesTree = { ptos: {}, stop: {} };

    const process = (workItemId: number) => {
        // visit bottom up
        const children = epicTree.parentToChildrenMap[workItemId] || [];
        children.forEach(process);

        // get direct dependencies
        const predecessorsSet = new Set();
        const immediatePredecessors = dependencyTree.stop[workItemId] || [];
        immediatePredecessors.forEach(x => predecessorsSet.add(x));

        // get dependencies of children find their parents and merge
        children.forEach(child => {
            const predecessorsOfChildren = dependencyTree.stop[child] || [];
            const parentOfChildPredecessors = predecessorsOfChildren.map(poc => epicTree.childToParentMap[poc]);
            parentOfChildPredecessors.forEach(x => predecessorsSet.add(x));
        });
        const predecessors = Array.from(predecessorsSet).filter(w => w !== workItemId);
        result.stop[workItemId] = predecessors;
        predecessors.forEach(p => {
            if (!result.ptos[p]) {
                result.ptos[p] = [];
            }
            result.ptos[p].push(workItemId);
        });
    };
    // start the process with the root which is 0
    process(0);

    return result;
}
