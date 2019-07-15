import { IEpicTimelineState, IPortfolioPlanningState } from "../Contracts";
import {
    IProject,
    IEpic,
    ITimelineGroup,
    ITimelineItem,
    ProgressTrackingCriteria,
    IProjectConfiguration
} from "../../Contracts";
import moment = require("moment");

export function getProjects(state: IEpicTimelineState): IProject[] {
    return state.projects;
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

export function getEpics(state: IEpicTimelineState): IEpic[] {
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

export function getTimelineItems(state: IEpicTimelineState): ITimelineItem[] {
    return state.epics.map(epic => {
        let completed: number;
        let total: number;
        let progress: number;

        if (state.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount) {
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
            title: epic.title,
            start_time: moment(epic.startDate),
            end_time: moment(epic.endDate),
            itemProps: {
                completed: completed,
                total: total,
                progress: progress
            }
        };
    });
}

export function getSelectedItem(state: IEpicTimelineState): ITimelineItem {
    return getTimelineItems(state).find(item => item.id === state.selectedItemId);
}

export function getMessage(state: IEpicTimelineState): string {
    return state.message;
}

// TODO: Is there a way for the substate to be passed to these selectors?
export function getEpicById(state: IPortfolioPlanningState, id: number): IEpic {
    const found = state.epicTimelineState.epics.filter(epic => epic.id === id);

    if (found && found.length === 1) {
        return found[0];
    }

    return null;
}

export function getProjectConfigurationById(state: IPortfolioPlanningState, projectId: string): IProjectConfiguration {
    return state.epicTimelineState.projectConfiguration[projectId.toLowerCase()];
}

export function getSetDatesDialogHidden(state: IEpicTimelineState): boolean {
    return state.setDatesDialogHidden;
}

export function getAddEpicPanelOpen(state: IEpicTimelineState): boolean {
    return state.addItemsPanelOpen;
}

export function getProgressTrackingCriteria(state: IEpicTimelineState): ProgressTrackingCriteria {
    return state.progressTrackingCriteria;
}

export function getExceptionMessage(state: IPortfolioPlanningState): string {
    return state.epicTimelineState.exceptionMessage;
}
