import { IIterationDuration, IterationDurationKind } from "../Contracts/IIterationDuration";
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
export function areChildrenOutOfBounds(parentStartIteration: TeamSettingsIteration, parentEndIteration: TeamSettingsIteration, childrenIterationDuration: IIterationDuration, allIterations: TeamSettingsIteration[]): boolean {
    if (childrenIterationDuration.kind === IterationDurationKind.BacklogIteration || !parentStartIteration || !parentEndIteration) {
        return false;
    }
    const startIndex = allIterations.findIndex(itr => itr.id == parentStartIteration.id);
    const endIndex = allIterations.findIndex(itr => itr.id == parentEndIteration.id);
    const childStartIndex = allIterations.findIndex(itr => itr.id == childrenIterationDuration.startIteration.id);
    const childEndIndex = allIterations.findIndex(itr => itr.id == childrenIterationDuration.endIteration.id);
    return childStartIndex < startIndex || childEndIndex > endIndex;
}