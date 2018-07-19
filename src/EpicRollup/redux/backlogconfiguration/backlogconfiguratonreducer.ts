import { BacklogConfigurationMap } from "./backlogconfigurationcontracts";
import produce from "immer";
import { ProjectBacklogConfigurationActions, ProjectBacklogConfigurationReceivedType } from "./backlogconfigurationactions";

export function backlogConfigurationReducer(state: BacklogConfigurationMap, action: ProjectBacklogConfigurationActions): BacklogConfigurationMap {
    return produce(state, draft => {
        switch (action.type) {
            case ProjectBacklogConfigurationReceivedType:
                draft[action.payload.projectId] = action.payload.backlogConfiguration;
        }
    });
}