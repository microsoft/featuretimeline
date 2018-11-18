import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { WorkItemLink, WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import { IDictionaryNumberTo } from '../../../../Common/redux/Contracts/types';

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
