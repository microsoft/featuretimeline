import {
    ChangeParentAction,
    ChangeParentActionType,
    ReplaceWorkItemsAction,
    ReplaceWorkItemsActionType,
    WorkItemActions,
    WorkItemsReceivedAction,
    WorkItemsReceivedActionType,
    WorkItemLinksReceivedAction,
    WorkItemLinksReceivedActionType,
    StartUpdateWorkitemIterationAction,
    StartUpdateWorkitemIterationActionType
} from './actions';
import { IWorkItemsState, WorkItemLevel } from './types';
import { Reducer } from 'redux';

// Type-safe initialState!
export const initialState: IWorkItemsState = {
    workItemInfos: {}
};

const reducer: Reducer<IWorkItemsState> = (state: IWorkItemsState = initialState, action: WorkItemActions) => {
    switch (action.type) {
        case ChangeParentActionType:
            return handleChangeParent(state, action as ChangeParentAction);
        case WorkItemsReceivedActionType:
            return handleWorkItemsReceived(state, action as WorkItemsReceivedAction);
        case ReplaceWorkItemsActionType:
            return handleReplaceWorkItems(state, action as ReplaceWorkItemsAction);
        case WorkItemLinksReceivedActionType:
            return handleWorkItemLinksReceived(state, action as WorkItemLinksReceivedAction);
        case StartUpdateWorkitemIterationActionType:
            return handleStartUpdateWorkItemIteration(state, action as StartUpdateWorkitemIterationAction);
        default:
            return state;
    }
};

function handleStartUpdateWorkItemIteration(state: IWorkItemsState, action: StartUpdateWorkitemIterationAction): IWorkItemsState {
    const {
        workItem,
        teamIteration
    } = action.payload;

    const newState = { ...state };
    const workItemObject = newState.workItemInfos[workItem];
    if (workItemObject) {
        workItemObject.workItem.fields = { ...workItemObject.workItem.fields };
        workItemObject.workItem.fields["System.IterationPath"] = teamIteration.path;
    }
    return newState;
}

function handleChangeParent(state: IWorkItemsState, action: ChangeParentAction): IWorkItemsState {
    const {
        workItems,
        newParentId
    } = action.payload;

    const newState = { ...state };
    for (const childId of workItems) {
        changeParent(newState, childId, newParentId);
    }
    return newState;
}

function changeParent(newState: IWorkItemsState, childId: number, parentId: number) {
    const info = newState.workItemInfos[childId];
    const oldParentId = info.parent;
    if (parentId === oldParentId) {
        return;
    }

    const newParentInfo = newState.workItemInfos[parentId];

    // Remove work item from old parent
    if (oldParentId) {
        const oldParentInfo = newState[oldParentId];
        newState.workItemInfos[oldParentId] = {
            ...oldParentInfo
        };
        newState.workItemInfos[oldParentId].children = oldParentInfo.children.filter((id) => id !== childId);
    }

    if (parentId) {
        //Add workItem as child of new parent
        newState.workItemInfos[parentId] = {
            ...newParentInfo
        };

        newState.workItemInfos[parentId].children = [...newParentInfo.children, childId];
    };


    //Set parent id
    newState.workItemInfos[childId] = {
        ...newState.workItemInfos[childId],
        parent: parentId
    };

}

function handleWorkItemsReceived(state: IWorkItemsState, action: WorkItemsReceivedAction): IWorkItemsState {
    const newState = { ...state };
    const {
        workItems,
        parentWorkItemIds,
        currentLevelWorkItemIds
    } = action.payload;

    for (const workItem of workItems) {

        let level = WorkItemLevel.Child;
        if (parentWorkItemIds.some(parentId => parentId === workItem.id)) {
            level = WorkItemLevel.Parent;
        } else if (currentLevelWorkItemIds.some(currentId => currentId === workItem.id)) {
            level = WorkItemLevel.Current;
        }

        newState.workItemInfos[workItem.id] = {
            workItem,
            children: [],
            parent: 0,
            level
        };
    }

    return newState;
}

function handleReplaceWorkItems(state: IWorkItemsState, action: ReplaceWorkItemsAction): IWorkItemsState {
    const newState = { ...state };
    const {
        workItems
    } = action.payload;

    for (const workItem of workItems) {
        newState.workItemInfos[workItem.id] = {
            ...newState.workItemInfos[workItem.id],
            workItem: workItem
        };
    }

    return newState;
}

function handleWorkItemLinksReceived(state: IWorkItemsState, action: WorkItemLinksReceivedAction): IWorkItemsState {
    const newState = { ...state };
    const children = action.payload.workItemLinks.filter((link) => link.source);
    for (const relation of children) {
        let parentId = 0; relation.source.id;
        let childId = 0; relation.target.id;
        if (relation.rel === "System.LinkTypes.Hierarchy-Forward") {
            parentId = relation.source.id;
            childId = relation.target.id;
        } else if (relation.rel === "System.LinkTypes.Hierarchy-Reverse") {
            parentId = relation.target.id;
            childId = relation.source.id;
        }
        changeParent(newState, childId, parentId);
    }
    return newState;
}

export default reducer;
