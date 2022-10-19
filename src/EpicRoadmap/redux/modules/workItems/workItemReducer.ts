import produce from 'immer';
import { DependenciesReceivedType, EpicHierarchyReceivedType, PagedWorkItemsReceivedType, WorkItemsActions } from './workItemActions';
import { IWorkItemsState } from './workItemContracts';
import { StartUpdateWorkitemIterationActionType } from '../../../../Common/redux/actions/StartUpdateWorkitemIterationAction';
export function workItemsReducer(state: IWorkItemsState, action: WorkItemsActions): IWorkItemsState {
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
            case StartUpdateWorkitemIterationActionType:
                {
                    const {
                        workItem,
                        teamIteration
                    } = action.payload;
                    const workItemId = workItem[0];
                    const pagedItems =  draft.pagedWorkItems.filter(w => w.id === workItemId);
                    if (pagedItems && pagedItems[0] && pagedItems[0].fields) {
                        pagedItems[0].fields["System.IterationPath"] = teamIteration.path;
                    }

                }
        }
    });
}