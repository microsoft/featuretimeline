import { put, all, select, call } from "redux-saga/effects";
import { ProgressAwareActionCreator } from "../../../Common/redux/modules/ProgressAwareState/ProgressAwareStateActions";
import { getProjectId, getTeamId } from "../../../Common/redux/Selectors/CommonSelectors";
import { fetchBacklogConfiguration } from "./fetchBacklogConfigurationSaga";
import { fetchTeamIterations, fetchTeamSettings } from "./fetchTeamSettingsSaga";
import { restoreSettings } from "../../../Common/redux/modules/SettingsState/SettingsStateSagas";
import { fetchIterationDisplayOptions } from "../../../Common/redux/modules/IterationDisplayOptions/iterationDisplayOptionsSaga";
import { backlogConfigurationForProjectSelector } from "../modules/backlogconfiguration/backlogconfigurationselector";
import { BacklogConfiguration } from "TFS/Work/Contracts";
import { WorkItemMetadataService } from "../../../Services/WorkItemMetadataService";
import { workItemTypesReceived, workItemStateColorsReceived } from "../modules/workItemMetadata/workItemMetadataActionCreators";
import { EpicsMetadataAvailable } from "../contracts";

export function* FetchAllMetadata() {
    yield put(ProgressAwareActionCreator.setLoading(true));
    const projectId = getProjectId();
    const teamId = getTeamId();
    // get backlog configuration/ team settings and backlog iteration for the project/current team
    yield all([fetchBacklogConfiguration(), fetchTeamIterations(), fetchTeamSettings(), restoreSettings("EpicRoadmap"), fetchIterationDisplayOptions(teamId, "EpicRoadmap")]);
    const backlogConfiguration: BacklogConfiguration = yield select(backlogConfigurationForProjectSelector);

    if (backlogConfiguration.portfolioBacklogs.length < 2) {
        yield put(ProgressAwareActionCreator.setError(new Error("Epics backlog level is not configured.")));
        return;
    }

    const workItemTypeNames = [];
    backlogConfiguration.portfolioBacklogs.reduce((workItemTypeNames, backlog) => {
        workItemTypeNames.push(...backlog.workItemTypes.map(w => w.name));
        return workItemTypeNames;
    }, workItemTypeNames);

    workItemTypeNames.push(...backlogConfiguration.requirementBacklog.workItemTypes.map(w => w.name));
    const metadataService = WorkItemMetadataService.getInstance();
    const [stateColors, wits] = yield all(
        [
            call([metadataService, metadataService.getStates], projectId, workItemTypeNames),
            call(metadataService.getWorkItemTypes.bind(metadataService), projectId)
        ]);


    yield put(workItemTypesReceived(projectId, wits));
    yield put(workItemStateColorsReceived(projectId, stateColors));
    yield put({ type: EpicsMetadataAvailable });
}