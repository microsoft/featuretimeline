import { IWorkItemInfo, WorkItemLevel } from '../store/workitems/types';
import { StateCategory } from '../../../Common/redux/Contracts/types';

// returns all work items for given level
export function getWorkItemsForLevel(
    workItemInfos: IDictionaryNumberTo<IWorkItemInfo>,
    level: WorkItemLevel,
    stateCategory: StateCategory): number[] {

    let filterByCategory = true;
    if (stateCategory === undefined || stateCategory === null) {
        filterByCategory = false;
    }
    const allIds: string[] = Object.keys(workItemInfos);
    const ids = allIds.filter(
        (id) =>
            workItemInfos[Number(id)].level === level &&
            (!filterByCategory || workItemInfos[Number(id)].stateCategory === stateCategory));

    return ids.map(i => Number(i));
}