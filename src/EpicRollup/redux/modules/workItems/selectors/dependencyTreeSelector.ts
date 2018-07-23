import { createSelector } from 'reselect';
import { IDependenciesTree } from '../workItemContracts';
import { WorkItemLink } from 'TFS/WorkItemTracking/Contracts';
import { getEpicDependenciesLinks } from './workItemSelector';
import { normalizedEpicTreeSelector, IEpicTree } from './epicTreeSelector';
const rawDependencyTreeSelector = createSelector(getEpicDependenciesLinks, createRawDependencyTree);
export function createRawDependencyTree(links: WorkItemLink[]) {
    const result: IDependenciesTree = {
        ptos: {},
        stop: {}
    };

    // Source is successor target is predecessor
    links.forEach(link => {
        const successor = link.source.id;
        const predecessor = link.target.id;
        if (!result.ptos[predecessor]) {
            result.ptos[predecessor] = [];
        }
        if (!result.stop[successor]) {
            result.stop[successor] = [];
        }
        result.ptos[predecessor].push(successor);
        result.stop[successor].push(predecessor);
    });

    return result;
}

/**
 * Normalizes the dependency tree where the parents relation ships are created due to children
 */
export const normalizedDependencyTreeSelector = createSelector(normalizedEpicTreeSelector, rawDependencyTreeSelector, createNormalizedDependencyTree);
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
        const predecessors = Array.from(predecessorsSet);
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
