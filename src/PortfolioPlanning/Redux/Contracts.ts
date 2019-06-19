import { IProject, IEpic } from "../Contracts";

export interface IPortfolioPlanningState {
    epicTimelineState: IEpicTimelineState;
}

export interface IEpicTimelineState {
    projects: IProject[];
    epics: IEpic[];
    message: string;
}
