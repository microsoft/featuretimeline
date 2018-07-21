import { createSelector } from 'reselect';
import { WorkItemLink, WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { backlogConfigurationForProjectSelector } from '../backlogconfiguration/backlogconfigurationselector';
import { BacklogConfiguration, BacklogLevelConfiguration } from 'TFS/Work/Contracts';
import { IEpicRollupState } from '../../contracts';
function getEpicHierarchyLinks(state: IEpicRollupState) {
    return state.epicHierarchy;
}

function getEpicDependenciesLinks(state: IEpicRollupState) {
    return state.dependencies;
}

function getPagedWorkItems(state: IEpicRollupState) {
    return state.pagedWorkItems;
}

const getWorkItemsMap = createSelector(getPagedWorkItems, (workItems: WorkItem[]) => {
    const map = {};
    workItems.forEach(wit => map[wit.id] = wit);
    return map;
})

export interface IEpicTree {
    parentToChildrenMap: IDictionaryNumberTo<number[]>;
    childToParentMap: IDictionaryNumberTo<number>;
}

const rawEpicTreeSelector =
    createSelector(getEpicHierarchyLinks,
        (links: WorkItemLink[]) => {
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
        });

export const normalizedEpicTreeSelector =
    createSelector(
        backlogConfigurationForProjectSelector,
        getWorkItemsMap,
        rawEpicTreeSelector,
        getNormalizedEpicTree);

function getWorkItemTypeRankMap(backlogConfiguration: BacklogConfiguration): IDictionaryStringTo<number> {
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
function getNormalizedEpicTree(
    backlogConfiguration: BacklogConfiguration,
    workItemsMap: IDictionaryNumberTo<WorkItem>,
    epicTree: IEpicTree): IEpicTree {

    const {
        parentToChildrenMap
    } = epicTree;

    const result: IEpicTree = {
        parentToChildrenMap: {},
        childToParentMap: {}
    };

    const witRankMap = getWorkItemTypeRankMap(backlogConfiguration);

    const normalizeChild = (grandParentId: number, parentId: number, parentWitRank: number) => {
        let children: number[] = parentToChildrenMap[parentId];
        while (children && children.length > 0) {
            children.forEach(childId => {
                const childWitRank = witRankMap[workItemsMap[childId].fields["System.WorkItemType"]];
                // exclude if child work item type is not part of backlog level hierarchy
                if (childWitRank) {
                    result.parentToChildrenMap[childId] = [];
                    // if child and parent are of same type then make child the sibling of parent
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

// export const dependencyTreeSelector = createSelector(
//     normalizedEpicTreeSelector, getEpicDependenciesLinks,
//     (epicTree: IEpicTree, dependencyLinks: WorkItemLink[]) => {
//         // Visit bottom up
//         // Get direct dependencies
//         // Get dependencies of children and then merge

//         return null;
//     });
