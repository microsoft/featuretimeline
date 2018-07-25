import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { IIterationDisplayOptions, IWorkItemDisplayDetails } from "../Contracts/GridViewContracts";
import { compareIteration } from "../Helpers/iterationComparer";

export function getDisplayIterations(
    backlogIteration: TeamSettingsIteration,
    teamIterations: TeamSettingsIteration[],
    workItems: IWorkItemDisplayDetails[],
    canIncludeBacklogIteration: boolean,
    iterationDisplayOptions?: IIterationDisplayOptions): TeamSettingsIteration[] {
    // Sort the input iteration
    teamIterations = teamIterations.slice().sort(compareIteration);
    const validIterationDisplayOptions = iterationDisplayOptions && iterationDisplayOptions.startIndex != null && iterationDisplayOptions.endIndex != null;

    if (validIterationDisplayOptions) {
        return teamIterations.slice(iterationDisplayOptions.startIndex, iterationDisplayOptions.endIndex + 1);
    }

    let firstIteration: TeamSettingsIteration = null;
    let lastIteration: TeamSettingsIteration = null;
    let atleastHaveOneBacklogIteation = false;
    // Get all iterations that come in the range of the workItems
    const calcFirstLastIteration = (workItem: IWorkItemDisplayDetails) => {
        const {
            startIteration,
            endIteration
        } = workItem.iterationDuration;

        if (startIteration.id !== backlogIteration.id && endIteration.id !== backlogIteration.id) {
            if (firstIteration === null) {
                firstIteration = startIteration;
                lastIteration = endIteration;
            }
            else {
                if (compareIteration(startIteration, firstIteration) < 0) {
                    firstIteration = startIteration;
                }
                if (compareIteration(endIteration, lastIteration) > 0) {
                    lastIteration = endIteration;
                }
            }
        } else {
            atleastHaveOneBacklogIteation = true;
        }
        workItem.children.forEach(child => calcFirstLastIteration(child));
    };
    workItems.forEach(calcFirstLastIteration);

    // If there are no planned workitems use first and last team iteration
    if (!firstIteration || !lastIteration) {
        firstIteration = teamIterations[0];
        lastIteration = teamIterations[teamIterations.length - 1];
    }

    const additionalIterations = canIncludeBacklogIteration ? 1 : 2;
    // Get two to the left and two to the right iterations from candiateIterations
    let startIndex = teamIterations.findIndex(i => i.id === firstIteration.id) - additionalIterations;
    let endIndex = teamIterations.findIndex(i => i.id === lastIteration.id) + additionalIterations;
    startIndex = startIndex < 0 ? 0 : startIndex;
    endIndex = endIndex >= teamIterations.length ? teamIterations.length - 1 : endIndex;
    const displayIterations = teamIterations.slice(startIndex, endIndex + 1);

    if (canIncludeBacklogIteration) {
        displayIterations.push(backlogIteration);
    }

    canIncludeBacklogIteration = canIncludeBacklogIteration && atleastHaveOneBacklogIteation;
    return displayIterations;
}