import { BacklogConfigurationMap } from "./backlogconfigurationcontracts";
import produce from "immer";
import { ProjectBacklogConfigurationActions, ProjectBacklogConfigurationReceivedType } from "./backlogconfigurationactions";

export function backlogConfigurationReducer(state: BacklogConfigurationMap, action: ProjectBacklogConfigurationActions): BacklogConfigurationMap {
    if(!state) {
        state = {};
    }
    return produce(state, draft => {
        const {
            payload
        } = action;
        switch (action.type) {
            case ProjectBacklogConfigurationReceivedType:
                {
                    const {
                        projectId,
                        backlogConfiguration
                    } = payload;
                    draft[projectId] = backlogConfiguration;
                    draft[projectId].portfolioBacklogs.sort((pb1, pb2) => pb1.rank - pb2.rank);
                }
        }
    });
}