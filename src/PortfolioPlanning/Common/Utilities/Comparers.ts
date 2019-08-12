import { IProject, IWorkItem } from "../../Contracts";
import { convertToString } from "./String";
import { Project } from "../../Models/PortfolioPlanningQueryModels";

export function defaultIProjectComparer(firstProject: IProject, secondProject: IProject): number {
    const firstProjectName = convertToString(firstProject.title, true /** upperCase */, true /** useLocale */);
    const secondProjectName = convertToString(secondProject.title, true /** upperCase */, true /** useLocale */);

    return defaultStringComparer(firstProjectName, secondProjectName);
}

export function defaultProjectComparer(firstProject: Project, secondProject: Project): number {
    const firstProjectName = convertToString(firstProject.ProjectName, true /** upperCase */, true /** useLocale */);
    const secondProjectName = convertToString(secondProject.ProjectName, true /** upperCase */, true /** useLocale */);

    return defaultStringComparer(firstProjectName, secondProjectName);
}

function defaultStringComparer(a: string, b: string): number {
    if (a === b) {
        return 0;
    } else if (a < b) {
        return -1;
    } else {
        return 1;
    }
}

export function defaultIWorkItemComparer(firstWorkItem: IWorkItem, secondWorkItem: IWorkItem): number {
    const firstWorkItemName = firstWorkItem!.title!.toLowerCase();
    const secondWorkItemName = secondWorkItem!.title!.toLowerCase();

    return defaultStringComparer(firstWorkItemName, secondWorkItemName);
}