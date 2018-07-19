import { IProjectBacklogConfigurationAwareState, BacklogConfigurationMap } from "./backlogconfigurationcontracts";
import { createSelector } from "reselect";
import { getProjectId } from "../../../Common/CommonSelectors";

export const getBacklogConfigurationMap = (state: IProjectBacklogConfigurationAwareState) => state.backlogConfigurations;

export const backlogConfigurationForProjectSelector = createSelector(
    [getBacklogConfigurationMap, getProjectId],
    (map, projectId) => map[projectId]
);