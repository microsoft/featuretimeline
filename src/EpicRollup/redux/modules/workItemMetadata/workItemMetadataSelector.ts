import { createSelector } from "reselect";
import { getProjectId } from "../../../../Common/redux/Selectors/CommonSelectors";
import { IEpicRollupState } from "../../contracts";
import { ProjectWorkItemMetadataMap } from "./workItemMetadataContracts";

export function getWorkItemMetadata(state: IEpicRollupState) {
    return state.workItemMetadata;
}


export const workItemMetadataSelector = createSelector(
    getProjectId,
    getWorkItemMetadata,
    (projectId: string, metadata: ProjectWorkItemMetadataMap) => {
        return metadata[projectId];
    }
    
)