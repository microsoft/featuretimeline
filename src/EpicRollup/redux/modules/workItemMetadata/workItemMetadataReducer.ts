import { Reducer } from 'redux';
import produce from "immer";
import { IWorkItemMetadata, ProjectWorkItemMetadataMap } from './workItemMetadataContracts';
import { WorkItemTypesReceivedActionType, MetaDataActions, WorkItemTypesReceivedAction, WorkItemStateColorsReceivedAction, WorkItemStateColorsReceivedActionType } from './workItemMetadataActions';
// Type-safe initialState!
export const getInitialState = (): ProjectWorkItemMetadataMap => {
    return {}
};

export const workItemMetadataReducer: Reducer<ProjectWorkItemMetadataMap> = (state: ProjectWorkItemMetadataMap = getInitialState(), action: MetaDataActions) => {
    switch (action.type) {
        case WorkItemTypesReceivedActionType:
            return handleWorkItemTypesReceived(state, action as WorkItemTypesReceivedAction);
        case WorkItemStateColorsReceivedActionType:
            return handleWorkItemStateColorsReceived(state, action as WorkItemStateColorsReceivedAction);
        default:
            return state;
    }
};

function handleWorkItemTypesReceived(state: ProjectWorkItemMetadataMap, action: WorkItemTypesReceivedAction): ProjectWorkItemMetadataMap {
    return produce(state, draft => {
        const {
            projectId,
            workItemTypes
        } = action.payload;

        const projectData: IWorkItemMetadata = draft[projectId] || {} as IWorkItemMetadata;
        projectData.workItemTypes = workItemTypes;
        draft[projectId] = projectData;
    });
}

function handleWorkItemStateColorsReceived(state: ProjectWorkItemMetadataMap, action: WorkItemStateColorsReceivedAction): ProjectWorkItemMetadataMap {
    return produce(state, draft => {
        const {
            projectId,
            workItemTypeStateColors
        } = action.payload;

        let projectData: IWorkItemMetadata = draft[projectId] || {} as IWorkItemMetadata;
        projectData.workItemStateColors = workItemTypeStateColors;
        draft[projectId] = projectData;
    });
}
