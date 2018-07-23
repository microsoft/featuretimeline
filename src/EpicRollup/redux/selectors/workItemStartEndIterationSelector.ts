import { createSelector } from 'reselect';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { SavedOverriddenIteration } from '../../../Common/modules/OverrideIterations/overriddenIterationContracts';
import { OverriddenIterationSelector } from '../../../Common/modules/OverrideIterations/overriddenIterationsSelector';
import { teamIterationsSelector } from '../modules/teamIterations/teamIterationSelector';
import { normalizedDependencyTreeSelector } from '../modules/workItems/selectors/dependencyTreeSelector';
import { IEpicTree, normalizedEpicTreeSelector } from "../modules/workItems/selectors/epicTreeSelector";
import { pagedWorkItemsMapSelector } from '../modules/workItems/selectors/workItemSelector';
import { IDependenciesTree } from '../modules/workItems/workItemContracts';

export enum IterationDurationCriteria {
    Overridden = 1,
    Dependencies = 2,
    Children = 3,
    Self = 4
};
export type WorkItemStartEndIteration = IDictionaryNumberTo<{
    start: string,
    end: string,
    criteria: IterationDurationCriteria,
    user?: string
}>;

export const workItemStartEndIterationSelector = createSelector(
    normalizedEpicTreeSelector,
    normalizedDependencyTreeSelector,
    OverriddenIterationSelector,
    teamIterationsSelector,
    pagedWorkItemsMapSelector,
    getWorkItemIterationDuration
);

export function getWorkItemIterationDuration(
    epicTree: IEpicTree,
    depTree: IDependenciesTree,
    overriddenIterations: SavedOverriddenIteration,
    teamIterations: TeamSettingsIteration[],
    pagedWorkItems: IDictionaryNumberTo<WorkItem>) {

    const result: WorkItemStartEndIteration = {};

    // build bottom up
    const process = (workItemId: number) => {
        // If already processed return
        if (result[workItemId]) {
            return;
        }

        // visit bottom up
        const children = epicTree.parentToChildrenMap[workItemId] || [];
        children.forEach(process);

        // 1. choose overriddenIteration if provided
        const overriddenIteration = overriddenIterations[workItemId];
        if (overriddenIteration) {
            result[workItemId] = {
                start: overriddenIteration.startIterationId,
                end: overriddenIteration.endIterationId,
                criteria: IterationDurationCriteria.Overridden,
                user: overriddenIteration.user
            };
        } else {
            // 2. If any predecessor choose start iteration = Max(predecessor end iteration) +1
            // process predecessors to ensure we have them sorted out
            const predecessors = depTree.stop[workItemId];
            let startIndex = -1;
            let endIndex = -1;
            predecessors.forEach(p => {
                process(p);
                startIndex = teamIterations.findIndex(i => i.id === result[p].end) + 1;
            });

            // 3. choose min start , max end date of children
            let minChildStart = teamIterations.length;
            let maxChildEnd = -1;
            let criteria = IterationDurationCriteria.Dependencies;
            children.forEach(c => {
                const childStart = teamIterations.findIndex(i => i.id === result[c].start);
                const childEnd = teamIterations.findIndex(i => i.id === result[c].end);
                if (childStart < minChildStart) {
                    minChildStart = childStart;
                }
                if (maxChildEnd === -1) {
                    maxChildEnd = minChildStart;
                }
                if (childEnd > maxChildEnd) {
                    maxChildEnd = childEnd;
                }
            });

            if (minChildStart > startIndex) {
                criteria = IterationDurationCriteria.Children;
                startIndex = minChildStart;
            }
            if (endIndex < maxChildEnd) {
                endIndex = maxChildEnd;
            }

            // 4. choose self's iteration
            if (startIndex === -1) {
                criteria = IterationDurationCriteria.Self;
                const workItem = pagedWorkItems[workItemId];
                const iterationPath = workItem.fields["System.IterationPath"];
                startIndex = endIndex = teamIterations.findIndex(itr => itr.path === iterationPath);
            }

            result[workItemId] = {
                start: startIndex >= 0 ? teamIterations[startIndex].id : null,
                end: endIndex >= 0 ? teamIterations[endIndex].id : null,
                criteria
            }
        }
    };

    process(0);
}