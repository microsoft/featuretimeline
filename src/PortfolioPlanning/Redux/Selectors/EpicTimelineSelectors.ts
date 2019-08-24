import { IEpicTimelineState, IPortfolioPlanningState } from "../Contracts";
import { IProject, IWorkItem, ITimelineGroup, ITimelineItem, ProgressTrackingUserSetting } from "../../Contracts";
import moment = require("moment");
import { ExtendedSinglePlanTelemetry } from "../../Models/TelemetryModels";
import { UserSettings } from "../../Models/UserSettingsDataModels";

export function getProjects(state: IEpicTimelineState): IProject[] {
    return state.projects;
}

export function getIndexedProjects(state: IEpicTimelineState): { [projectIdKey: string]: IProject } {
    const result: { [projectIdKey: string]: IProject } = {};

    state.projects.forEach(project => {
        const projectIdKey = project.id.toLowerCase();
        result[projectIdKey] = project;
    });

    return result;
}

export function getProjectNames(state: IPortfolioPlanningState): string[] {
    return state.epicTimelineState.projects.map(project => project.title);
}

export function getTeamNames(state: IPortfolioPlanningState): string[] {
    return Object.keys(state.epicTimelineState.teams)
        .map(teamId => state.epicTimelineState.teams[teamId])
        .map(team => team.teamName);
}

export function getTimelineGroups(state: IEpicTimelineState): ITimelineGroup[] {
    return state.projects.map(project => {
        return {
            id: project.id,
            title: project.title
        };
    });
}

export function getEpics(state: IEpicTimelineState): IWorkItem[] {
    return state.epics;
}

export function getEpicIds(state: IEpicTimelineState): { [epicId: number]: number } {
    const result: { [epicId: number]: number } = {};

    state.epics.map(epic => {
        if (!result[epic.id]) {
            result[epic.id] = epic.id;
        }
    });

    return result;
}

export function getTimelineItems(state: IEpicTimelineState, userSettings: UserSettings): ITimelineItem[] {
    return state.epics.map(epic => {
        let completed: number;
        let total: number;
        let progress: number;

        if (userSettings.ProgressTrackingOption === ProgressTrackingUserSetting.CompletedCount.Key) {
            completed = epic.completedCount;
            total = epic.totalCount;
            progress = epic.countProgress;
        } else {
            completed = epic.completedEffort;
            total = epic.totalEffort;
            progress = epic.effortProgress;
        }

        return {
            id: epic.id,
            group: epic.project,
            teamId: epic.teamId,
            projectId: epic.project,
            backlogLevel: epic.backlogLevel,
            title: epic.title,
            iconUrl: epic.iconProps.url,
            start_time: moment(epic.startDate),
            end_time: moment(epic.endDate),
            itemProps: {
                completed: completed,
                total: total,
                progress: progress
            },
            canMove: !epic.itemUpdating,
            canResize: !epic.itemUpdating
        };
    });
}

export function getSelectedItem(state: IEpicTimelineState, userSettings: UserSettings): ITimelineItem {
    return getTimelineItems(state, userSettings).find(item => item.id === state.selectedItemId);
}

export function getMessage(state: IEpicTimelineState): string {
    return state.message;
}

// TODO: Is there a way for the substate to be passed to these selectors?
export function getWorkItemById(state: IPortfolioPlanningState, id: number): IWorkItem {
    const found = state.epicTimelineState.epics.filter(epic => epic.id === id);

    if (found && found.length === 1) {
        return found[0];
    }

    return null;
}

export function getSetDatesDialogHidden(state: IEpicTimelineState): boolean {
    return state.setDatesDialogHidden;
}

export function getAddEpicPanelOpen(state: IEpicTimelineState): boolean {
    return state.addItemsPanelOpen;
}

export function getExceptionMessage(state: IPortfolioPlanningState): string {
    return state.epicTimelineState.exceptionMessage;
}

export function getPlanExtendedTelemetry(state: IEpicTimelineState): ExtendedSinglePlanTelemetry {
    const epicsPerProject = state.epics ? getEpicCountPerProject(state.epics) : {};
    const epicsPerProjectCount: number[] = [];
    Object.keys(epicsPerProject).forEach(projectId => {
        epicsPerProjectCount.push(epicsPerProject[projectId]);
    });

    return {
        teams: state.teams ? Object.keys(state.teams).length : 0,
        projects: state.projects ? state.projects.length : 0,
        epicsPerProject: epicsPerProjectCount
    };
}

export function getEpicCountPerProject(epics: IWorkItem[]): { [projectId: string]: number } {
    if (!epics) {
        return {};
    }

    const result: { [projectId: string]: number } = {};
    epics.forEach(epic => {
        const projectIdKey = epic.project.toLowerCase();
        if (!result[projectIdKey]) {
            result[projectIdKey] = 0;
        }

        result[projectIdKey]++;
    });

    return result;
}
