import produce from 'immer';
import { DependenciesReceivedType, EpicHierarchyReceivedType, PagedWorkItemsReceivedType, WorkItemsActions } from './workItemActions';
import { IEpicRollupWorkItemAwareState } from './workItemContracts';
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