import { createSelector } from "reselect";
import { getProjectId } from "../../../../Common/redux/Selectors/CommonSelectors";
import { IProjectBacklogConfigurationAwareState } from "./backlogconfigurationcontracts";

export const getBacklogConfigurationMap = (state: IProjectBacklogConfigurationAwareState) => state.backlogConfigurations;

export const backlogConfigurationForProjectSelector =
    createSelector(
        [getBacklogConfigurationMap, getProjectId],
        (map, projectId) => map[projectId]
    );