import { IWorkItemInfo, WorkItemLevel } from '../store/workitems/types';

// returns all work items for given level
export function getWorkItemsForLevel(
    workItemInfos: IDictionaryNumberTo<IWorkItemInfo>,
    level: WorkItemLevel): number[] {

    const allIds: string[] = Object.keys(workItemInfos);
    const ids = allIds.filter((id) => workItemInfos[Number(id)].level === level);

    return ids.map(i => Number(i));
}