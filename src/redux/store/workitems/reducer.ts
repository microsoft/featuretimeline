import {
    ChangeParentAction,
    ChangeParentActionType,
    WorkItemActions,
    WorkItemsReceivedAction,
    WorkItemsReceivedActionType,
    WorkItemLinksReceivedAction,
    WorkItemLinksReceivedActionType,
    StartUpdateWorkitemIterationAction,
    StartUpdateWorkitemIterationActionType,
    StartMarkInProgressActionType,
    StartMarkInProgressAction
} from './actions';
import { IWorkItemsState, WorkItemLevel, StateCategory } from './types';
import { Reducer } from 'redux';
import { getWorkItemStateCategory } from '../../helpers/getWorkItemStateCategory';
import produce from "immer";

// Type-safe initialState!
const getIntialState = () => {
    return {
        workItemInfos: {}
    }
};

const reducer: Reducer<IWorkItemsState> = (state: IWorkItemsState = getIntialState(), action: WorkItemActions) => {
    switch (action.type) {
        case ChangeParentActionType:
            return handleChangeParent(state, action as ChangeParentAction);
        case WorkItemsReceivedActionType:
            return handleWorkItemsReceived(state, action as WorkItemsReceivedAction);
        case WorkItemLinksReceivedActionType:
            return handleWorkItemLinksReceived(state, action as WorkItemLinksReceivedAction);
        case StartUpdateWorkitemIterationActionType:
            return handleStartUpdateWorkItemIteration(state, action as StartUpdateWorkitemIterationAction);
        case StartMarkInProgressActionType:
            return handleStartMarkInProgress(state, action as StartMarkInProgressAction);
        default:
            return state;
    }
};

function handleStartUpdateWorkItemIteration(state: IWorkItemsState, action: StartUpdateWorkitemIterationAction): IWorkItemsState {
    const {
        workItem,
        teamIteration
    } = action.payload;

    return produce(state, draft => {
        const workItemObject = draft.workItemInfos[workItem];
        if (workItemObject) {
            workItemObject.workItem.fields["System.IterationPath"] = teamIteration.path;
        }
    });
}

function handleStartMarkInProgress(workItemState: IWorkItemsState, action: StartMarkInProgressAction): IWorkItemsState {
    const {
        workItem,
        teamIteration
    } = action.payload;

    return produce(workItemState, draft => {
        let workItemObject = draft.workItemInfos[workItem];
        if (workItemObject) {
            workItemObject.workItem.fields["System.IterationPath"] = teamIteration.path;
            workItemObject.stateCategory = StateCategory.InProgress;
        }
    });
}


function handleChangeParent(state: IWorkItemsState, action: ChangeParentAction): IWorkItemsState {
    const {
        workItems,
        newParentId
    } = action.payload;

    return produce(state, draft => {
        for (const childId of workItems) {
            changeParent(draft, childId, newParentId);
        }
    });
}

function changeParent(draft: IWorkItemsState, childId: number, parentId: number) {
    const info = draft.workItemInfos[childId];
    const oldParentId = info.parent;
    if (parentId === oldParentId) {
        return;
    }

    const newParentInfo = draft.workItemInfos[parentId];

    // Remove work item from old parent
    if (oldParentId) {
        const oldParentInfo = draft[oldParentId];
        draft.workItemInfos[oldParentId] = oldParentInfo;
        draft.workItemInfos[oldParentId].children = oldParentInfo.children.filter((id) => id !== childId);
    }

    if (parentId) {
        //Add workItem as child of new parent
        draft.workItemInfos[parentId] = newParentInfo;
        draft.workItemInfos[parentId].children.push(childId);
    };


    //Set parent id
    draft.workItemInfos[childId].parent = parentId;

}

function handleWorkItemsReceived(state: IWorkItemsState, action: WorkItemsReceivedAction): IWorkItemsState {
    const {
        workItems,
        parentWorkItemIds,
        currentLevelWorkItemIds,
        workItemTypeStateInfo
    } = action.payload;

    return produce(state, draft => {
        for (const workItem of workItems) {

            let level = WorkItemLevel.Child;
            if (parentWorkItemIds.some(parentId => parentId === workItem.id)) {
                level = WorkItemLevel.Parent;
            } else if (currentLevelWorkItemIds.some(currentId => currentId === workItem.id)) {
                level = WorkItemLevel.Current;
            }

            const stateCategory = getWorkItemStateCategory(workItem.fields["System.WorkItemType"], workItem.fields["System.State"], workItemTypeStateInfo);

            draft.workItemInfos[workItem.id] = {
                workItem,
                children: [],
                parent: 0,
                level,
                stateCategory
            };
        }

    });
}

function handleWorkItemLinksReceived(state: IWorkItemsState, action: WorkItemLinksReceivedAction): IWorkItemsState {
    return produce(state, draft => {
        const children = action.payload.workItemLinks.filter((link) => link.source);
        for (const relation of children) {
            let parentId = 0;
            let childId = 0;
            if (relation.rel === "System.LinkTypes.Hierarchy-Forward") {
                parentId = relation.source.id;
                childId = relation.target.id;
            } else if (!relation.rel || relation.rel === "System.LinkTypes.Hierarchy-Reverse") {
                parentId = relation.target.id;
                childId = relation.source.id;
            }

            if (childId > 0) {
                changeParent(draft, childId, parentId);
            }
        }
    });
}

export default reducer;
