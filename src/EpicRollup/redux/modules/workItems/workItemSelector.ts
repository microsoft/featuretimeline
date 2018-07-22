import { createSelector } from 'reselect';
import { WorkItemLink, WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { backlogConfigurationForProjectSelector } from '../backlogconfiguration/backlogconfigurationselector';
import { BacklogConfiguration, BacklogLevelConfiguration } from 'TFS/Work/Contracts';
import { IEpicRollupState } from '../../contracts';
import { IDependenciesTree } from './workItemContracts';
function getEpicHierarchyLinks(state: IEpicRollupState) {
    return state.epicHierarchy;
}

function getEpicDependenciesLinks(state: IEpicRollupState) {
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

export interface IEpicTree {
    parentToChildrenMap: IDictionaryNumberTo<number[]>;
    childToParentMap: IDictionaryNumberTo<number>;
}

const rawEpicTreeSelector = createSelector(getEpicHierarchyLinks, createRawEpicTree);
export function createRawEpicTree(links: WorkItemLink[]) {
    const epicTree: IEpicTree = {
        parentToChildrenMap: {},
        childToParentMap: {}
    };

    // target is child and source is parent
    links.reduce((epicTree, link) => {
        const childId = link.target.id;
        const parentId = link.source.id;
        const { childToParentMap, parentToChildrenMap } = epicTree;
        childToParentMap[childId] = parentId;
        if (!parentToChildrenMap[parentId]) {
            parentToChildrenMap[parentId] = [];
        }
        parentToChildrenMap[parentId].push(childId);
        return epicTree;
    }, epicTree);

    return epicTree;
}

export const normalizedEpicTreeSelector =
    createSelector(
        backlogConfigurationForProjectSelector,
        pagedWorkItemsMapSelector,
        rawEpicTreeSelector,
        createNormalizedEpicTree);

/**
 * Gets a map of WorkItemTypeName to its rank in backlog configuration
 */
export function getWorkItemTypeRankMap(backlogConfiguration: BacklogConfiguration): IDictionaryStringTo<number> {
    const result: IDictionaryStringTo<number> = {};
    const processBacklogLevel = (backlogLevel: BacklogLevelConfiguration) => {
        backlogLevel.workItemTypes.forEach(wit => result[wit.name] = backlogLevel.rank);
    }
    processBacklogLevel(backlogConfiguration.requirementBacklog);
    backlogConfiguration.portfolioBacklogs.forEach(processBacklogLevel);

    return result;
}


/**
 * Normalizes the epic tree where it removes Story/Story hierarchy, 
 * also removes any children not part of backlog level hierarchy
 */
export function createNormalizedEpicTree(
    backlogConfiguration: BacklogConfiguration,
    workItemsMap: IDictionaryNumberTo<WorkItem>,
    epicTree: IEpicTree): IEpicTree {

    const {
        parentToChildrenMap = {}
    } = epicTree;

    const result: IEpicTree = {
        parentToChildrenMap: {},
        childToParentMap: {}
    };

    const witRankMap = getWorkItemTypeRankMap(backlogConfiguration);

    const normalizeChild = (grandParentId: number, parentId: number, parentWitRank: number) => {
        let children: number[] = parentToChildrenMap[parentId];
        if (children && children.length > 0) {
            children.forEach(childId => {
                const childWitRank = witRankMap[workItemsMap[childId].fields["System.WorkItemType"]];
                // exclude if child work item type is not part of backlog level hierarchy
                if (childWitRank) {
                    result.parentToChildrenMap[childId] = [];
                    // if child and parent are of same rank then make child the sibling of parent
                    // note we deliberately don't handle story => feature/epic hierarchy where feature/epic is child of story
                    if (childWitRank === parentWitRank) {
                        result.parentToChildrenMap[grandParentId].push(childId);
                        result.childToParentMap[childId] = grandParentId;
                        normalizeChild(grandParentId, /*parentId*/ childId, /*parentWitRank*/ childWitRank);
                    } else {
                        result.parentToChildrenMap[parentId].push(childId);
                        result.childToParentMap[childId] = parentId;
                        normalizeChild(/*grandParentId*/ parentId, /*parentId*/ childId, /*parentWitRank*/ childWitRank);
                    }
                }
            })
        }
    };
    result.parentToChildrenMap[0] = [];
    normalizeChild(/*grandParentId*/ 0, /*parentId*/ 0, /*parentWitRank*/ -1);
    return result;
}

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
