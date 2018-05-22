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
import { TeamSettingsIteration } from 'TFS/Work/Contracts';

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

function handleStartUpdateWorkItemIteration(workItemState: IWorkItemsState, action: StartUpdateWorkitemIterationAction): IWorkItemsState {
    const {
        workItem,
        teamIteration
    } = action.payload;

    return changeIteration(workItemState, workItem, teamIteration);
}

function handleStartMarkInProgress(workItemState: IWorkItemsState, action: StartMarkInProgressAction): IWorkItemsState {
    const {
        workItem,
        teamIteration
    } = action.payload;

    return changeIteration(workItemState, workItem, teamIteration);
}


function changeIteration(workItemState: IWorkItemsState, workItem: number, teamIteration: TeamSettingsIteration) {
    const newState = { ...workItemState };
    const workItemInfos = { ...newState.workItemInfos };
    let workItemObject = workItemInfos[workItem];
    if (workItemObject) {
        workItemObject = { ...workItemObject };
        const workItemO = { ...workItemObject.workItem };
        workItemO.fields = {};
        workItemO.fields = { ...workItemObject.workItem.fields };
        workItemO.fields["System.IterationPath"] = teamIteration.path;
        workItemObject.stateCategory = StateCategory.InProgress;
        workItemObject.workItem = workItemO;
        workItemInfos[workItem] = workItemObject;
    }
    newState.workItemInfos = workItemInfos;
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

    const workItemInfos = { ...newState.workItemInfos };
    const newParentInfo = workItemInfos[parentId];

    // Remove work item from old parent
    if (oldParentId) {
        const oldParentInfo = newState[oldParentId];
        workItemInfos[oldParentId] = {
            ...oldParentInfo
        };
        workItemInfos[oldParentId].children = oldParentInfo.children.filter((id) => id !== childId);
    }

    if (parentId) {
        //Add workItem as child of new parent
        workItemInfos[parentId] = {
            ...newParentInfo
        };

        workItemInfos[parentId].children = [...newParentInfo.children, childId];
    };


    //Set parent id
    workItemInfos[childId] = {
        ...newState.workItemInfos[childId],
        parent: parentId
    };

    newState.workItemInfos = workItemInfos;
}

function handleWorkItemsReceived(state: IWorkItemsState, action: WorkItemsReceivedAction): IWorkItemsState {
    const newState = { ...state };
    const {
        workItems,
        parentWorkItemIds,
        currentLevelWorkItemIds,
        workItemTypeStateInfo
    } = action.payload;

    const workItemInfos = { ...newState.workItemInfos };
    for (const workItem of workItems) {

        let level = WorkItemLevel.Child;
        if (parentWorkItemIds.some(parentId => parentId === workItem.id)) {
            level = WorkItemLevel.Parent;
        } else if (currentLevelWorkItemIds.some(currentId => currentId === workItem.id)) {
            level = WorkItemLevel.Current;
        }

        const stateCategory = getWorkItemStateCategory(workItem.fields["System.WorkItemType"], workItem.fields["System.State"], workItemTypeStateInfo);

        workItemInfos[workItem.id] = {
            workItem,
            children: [],
            parent: 0,
            level,
            stateCategory
        };
    }
    newState.workItemInfos = workItemInfos;
    return newState;
}

function handleWorkItemLinksReceived(state: IWorkItemsState, action: WorkItemLinksReceivedAction): IWorkItemsState {
    let newState = state;
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
            newState = { ...state };
            changeParent(newState, childId, parentId);
        }
    }
    return newState;
}

export default reducer;
