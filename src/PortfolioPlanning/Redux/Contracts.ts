import { IProject, IEpic } from "../Contracts";

export interface IPortfolioPlanningState {
    projects: IProject[];
    epics: IEpic[];
    message: string;
}
