import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { WorkItemLink, WorkItem } from 'TFS/WorkItemTracking/Contracts';

export type TeamIterationsMap = { [teamId: string]: TeamSettingsIteration[] }

export interface IWorkItemsState {
    epicHierarchy: WorkItemLink[],
    dependencies: WorkItemLink[],
    pagedWorkItems: WorkItem[];
}

export interface IEpicRoadmapWorkItemAwareState {
    workItemsState: IWorkItemsState;
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

export interface INormalizedDependencyTree extends IDependenciesTree {
    /**
     * Indirect + Direct Predecessor to Successor
     */
    allPtos: IDictionaryNumberTo<number[]>;

    /**
     * Indirect + Direct Successor to Predecessor
     */
    allStop: IDictionaryNumberTo<number[]>;

}
