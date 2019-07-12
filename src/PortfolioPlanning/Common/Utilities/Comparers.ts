import { IProject } from "../../Contracts";
import { convertToString } from "./String";
import { Project } from "../../Models/PortfolioPlanningQueryModels";

export function defaultIProjectComparer(firstProject: IProject, secondProject: IProject): number {
    const firstProjectName = convertToString(firstProject.title, true /** upperCase */, true /** useLocale */);
    const secondProjectName = convertToString(secondProject.title, true /** upperCase */, true /** useLocale */);

    return defaultProjectNameComparer(firstProjectName, secondProjectName);
}

export function defaultProjectComparer(firstProject: Project, secondProject: Project): number {
    const firstProjectName = convertToString(firstProject.ProjectName, true /** upperCase */, true /** useLocale */);
    const secondProjectName = convertToString(secondProject.ProjectName, true /** upperCase */, true /** useLocale */);

    return defaultProjectNameComparer(firstProjectName, secondProjectName);
}

function defaultProjectNameComparer(a: string, b: string): number {
    if (a === b) {
        return 0;
    } else if (a < b) {
        return -1;
    } else {
        return 1;
    }
}
