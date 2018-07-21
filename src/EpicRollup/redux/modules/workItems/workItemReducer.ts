import { IEpicRollupWorkItemAwareState } from './workItemContracts';
import { WorkItemsActions, EpicHierarchyReceivedType, DependenciesReceivedType, PagedWorkItemsReceivedType } from './workItemActions';
import produce from 'immer';
export function workItemsReducer(state: IEpicRollupWorkItemAwareState, action: WorkItemsActions): IEpicRollupWorkItemAwareState {
    if (!state) {
        state = {
            epicHierarchy: [],
            dependencies: [],
            pagedWorkItems: []
        };
    }
    return produce(state, draft => {
        switch (action.type) {
            case EpicHierarchyReceivedType:
                draft.epicHierarchy = action.payload.links;
                break;
            case DependenciesReceivedType:
                draft.dependencies = action.payload.links;
                break;
            case PagedWorkItemsReceivedType:
                draft.pagedWorkItems = action.payload.workItems;
                break;
        }
    });
}