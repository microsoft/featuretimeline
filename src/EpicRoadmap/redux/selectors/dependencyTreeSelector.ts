import { createSelector } from 'reselect';
import { IDependenciesTree, INormalizedDependencyTree } from '../modules/workItems/workItemContracts';
import { WorkItemLink, WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
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
    dependencyTree: IDependenciesTree): INormalizedDependencyTree {
    const result: INormalizedDependencyTree = {
        ptos: deepExtend(dependencyTree.ptos),
        stop: deepExtend(dependencyTree.stop),
        allPtos: deepExtend(dependencyTree.ptos),
        allStop: deepExtend(dependencyTree.stop)
    };

    const process = (workItemId: number) => {
        // visit bottom up
        const children = epicTree.parentToChildrenMap[workItemId] || [];
        children.forEach(process);

        // get dependencies of children find their parents and merge
        const indirectPredecessors = new Set<number>();
        children.forEach(child => {
            const predecessorsOfChildren = dependencyTree.stop[child] || [];
            const parentOfChildPredecessors = predecessorsOfChildren.map(poc => epicTree.childToParentMap[poc]);
            parentOfChildPredecessors.forEach(x => indirectPredecessors.add(x));
        });
        const parentId = epicTree.childToParentMap[workItemId];
        const indirectPredecessorsArray = Array.from(indirectPredecessors)
            .filter(w => w !== workItemId)
            .filter(w => w !== parentId);

        if (indirectPredecessorsArray.length > 0) {
            if (!result.allStop[workItemId]) {
                result.allStop[workItemId] = [];
            }
            result.allStop[workItemId] = indirectPredecessorsArray;
            indirectPredecessors.forEach(p => {
                if (!result.allPtos[p]) {
                    result.allPtos[p] = [];
                }
                result.allPtos[p].push(workItemId);
            });
        }
    };
    // start the process with the root which is 0
    process(0);

    return result;
}

function deepExtend(source) {
    const destination = {};
    if(typeof source !== "object") {
        return source;
    }
    for (var property in source) {
        if (source[property] && source[property].constructor &&
            source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        } else if (source[property] && source[property].constructor &&
            source[property].constructor === Array) {
            destination[property] = source[property].map(v => deepExtend(v));
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
}