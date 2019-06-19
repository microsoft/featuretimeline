import { IEpicTimelineState } from "../Contracts";
import { IProject, IEpic } from "../../Contracts";

export function getProjects(state: IEpicTimelineState): IProject[] {
    return state.projects;
}

export function getEpics(state: IEpicTimelineState): IEpic[] {
    return state.epics;
}

export function getMessage(state: IEpicTimelineState): string {
    return state.message;
}

export function getAddEpicDialogOpen(state: IEpicTimelineState): boolean {
    return state.addEpicDialogOpen;
}
