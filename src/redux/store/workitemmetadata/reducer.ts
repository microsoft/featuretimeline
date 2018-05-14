import { Reducer } from 'redux';
import { IWorkItemMetadataState, IWorkItemMetadata } from './types';
import { WorkItemTypesReceivedActionType, MetaDataActions, WorkItemTypesReceivedAction, WorkItemStateColorsReceivedAction, WorkItemStateColorsReceivedActionType } from './actions';

// Type-safe initialState!
export const getInitialState = (): IWorkItemMetadataState => {
    return {
        // project -> metadata
        metadata: {}
    }
};

const reducer: Reducer<IWorkItemMetadataState> = (state: IWorkItemMetadataState = getInitialState(), action: MetaDataActions) => {
    switch (action.type) {
        case WorkItemTypesReceivedActionType:
            return handleWorkItemTypesReceived(state, action as WorkItemTypesReceivedAction);
        case WorkItemStateColorsReceivedActionType:
            return handleWorkItemStateColorsReceived(state, action as WorkItemStateColorsReceivedAction);
        default:
            return state;
    }
};

function handleWorkItemTypesReceived(state: IWorkItemMetadataState, action: WorkItemTypesReceivedAction): IWorkItemMetadataState {
    let newState = { ...state };
    const {
        projectId,
        workItemTypes
    } = action.payload;

    const projectData: IWorkItemMetadata = newState.metadata[projectId] ? { ...newState.metadata[projectId] } : {} as IWorkItemMetadata;
    projectData.workItemTypes = workItemTypes;
    newState.metadata[projectId] = projectData;
    return newState;
}

function handleWorkItemStateColorsReceived(state: IWorkItemMetadataState, action: WorkItemStateColorsReceivedAction): IWorkItemMetadataState {
    let newState = { ...state };
    const {
        projectId,
        workItemTypeStateColors
    } = action.payload;

    const projectData: IWorkItemMetadata = newState.metadata[projectId] ? { ...newState.metadata[projectId] } : {} as IWorkItemMetadata;
    projectData.workItemStateColors = workItemTypeStateColors;
    newState.metadata[projectId] = projectData;
    return newState;
}

export default reducer;
