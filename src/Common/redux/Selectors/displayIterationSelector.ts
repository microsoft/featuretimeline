import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { IterationDurationKind } from "../Contracts/IIterationDuration";
import { IIterationDisplayOptions, IWorkItemDisplayDetails } from "../Contracts/GridViewContracts";
import { compareIteration } from "../Helpers/iterationComparer";

export function getDisplayIterations(
    backlogIteration: TeamSettingsIteration,
    teamIterations: TeamSettingsIteration[],
    workItems: IWorkItemDisplayDetails[],
    includeBacklogIteration: boolean,
    iterationDisplayOptions?: IIterationDisplayOptions): TeamSettingsIteration[] {

    // Sort the input iteration
    teamIterations = teamIterations.slice().sort(compareIteration);
    const validIterationDisplayOptions = iterationDisplayOptions && iterationDisplayOptions.startIndex != null && iterationDisplayOptions.endIndex != null;

    if (validIterationDisplayOptions) {
        return teamIterations.slice(iterationDisplayOptions.startIndex, iterationDisplayOptions.endIndex + 1);
    }
    const hasBacklogIteration = (workItem: IWorkItemDisplayDetails) => {
        if (!includeBacklogIteration) {
            return false;
        }
        if (workItem.iterationDuration.kind === IterationDurationKind.BacklogIteration) {
            return true;
        }
        return workItem.children.some(child => hasBacklogIteration(child));
    };
    let firstIteration: TeamSettingsIteration = null;
    let lastIteration: TeamSettingsIteration = null;
    let showBacklogIteration = false;
    // Get all iterations that come in the range of the workItems
    const calcFirstLastIteration = (workItem: IWorkItemDisplayDetails) => {
        // If it is not sub grid and workItem iteration is backlog iteration than ignore it
        if (!includeBacklogIteration && workItem.iterationDuration.kind === IterationDurationKind.BacklogIteration) {
            // Do nothing
        }
        else {
            if (firstIteration === null) {
                firstIteration = workItem.iterationDuration.startIteration;
                lastIteration = workItem.iterationDuration.endIteration;
            }
            else {
                if (compareIteration(workItem.iterationDuration.startIteration, firstIteration) < 0) {
                    firstIteration = workItem.iterationDuration.startIteration;
                }
                if (compareIteration(workItem.iterationDuration.endIteration, lastIteration) > 0) {
                    lastIteration = workItem.iterationDuration.endIteration;
                }
            }
        }
        showBacklogIteration = includeBacklogIteration && (showBacklogIteration || (workItem.iterationDuration.kind === IterationDurationKind.BacklogIteration));
        workItem.children.forEach(child => calcFirstLastIteration(child));
    };
    workItems.forEach(workItem => calcFirstLastIteration(workItem));
    const candidateIterations = [...teamIterations];
    if (showBacklogIteration) {
        candidateIterations.push(backlogIteration);
        candidateIterations.sort(compareIteration);
    }
    // If there are no planned workitems use first and last team iteration
    if (!firstIteration || !lastIteration) {
        firstIteration = candidateIterations[0];
        lastIteration = candidateIterations[candidateIterations.length - 1];
    }
    const additionalIterations = includeBacklogIteration ? 1 : 2;
    // Get two to the left and two to the right iterations from candiateIterations
    let startIndex = candidateIterations.findIndex(i => i.id === firstIteration.id) - additionalIterations;
    let endIndex = candidateIterations.findIndex(i => i.id === lastIteration.id) + additionalIterations;
    startIndex = startIndex < 0 ? 0 : startIndex;
    endIndex = endIndex >= candidateIterations.length ? candidateIterations.length - 1 : endIndex;
    const displayIterations = candidateIterations.slice(startIndex, endIndex + 1);
    return displayIterations;
}