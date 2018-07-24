import { createSelector } from 'reselect';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { SavedOverriddenIteration } from '../../../Common/modules/OverrideIterations/overriddenIterationContracts';
import { OverriddenIterationSelector } from '../../../Common/modules/OverrideIterations/overriddenIterationsSelector';
import { teamIterationsSelector } from '../modules/teamIterations/teamIterationSelector';
import { normalizedDependencyTreeSelector } from './dependencyTreeSelector';
import { IEpicTree, normalizedEpicTreeSelector } from "./epicTreeSelector";
import { pagedWorkItemsMapSelector } from './workItemSelector';
import { IDependenciesTree } from '../modules/workItems/workItemContracts';
import { IIterationDuration, IterationDurationKind } from '../../../FeatureTimeline/redux/store/types';

export type WorkItemStartEndIteration = IDictionaryNumberTo<IIterationDuration>;

/**
 * Returns start/end iteration for work items based on 
 * dependency tree, overridden iterations and child iterations
 */
export const workItemStartEndIterationSelector = createSelector(
    normalizedEpicTreeSelector,
    normalizedDependencyTreeSelector,
    OverriddenIterationSelector,
    teamIterationsSelector as any,
    pagedWorkItemsMapSelector,
    getWorkItemIterationDuration
);

export function getWorkItemIterationDuration(
    epicTree: IEpicTree,
    depTree: IDependenciesTree,
    overriddenIterations: SavedOverriddenIteration,
    teamIterations: TeamSettingsIteration[],
    pagedWorkItems: IDictionaryNumberTo<WorkItem>): WorkItemStartEndIteration {

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
            const startIteration = teamIterations.find(i => i.id === overriddenIteration.startIterationId);
            const endIteration = teamIterations.find(i => i.id === overriddenIteration.endIterationId);

            result[workItemId] = {
                startIteration,
                endIteration,
                kind: IterationDurationKind.UserOverridden,
                overridedBy: overriddenIteration.user
            };
        } else {
            // 2. If any predecessor choose start iteration = Max(predecessor end iteration) +1
            // process predecessors to ensure we have them sorted out
            const predecessors = depTree.stop[workItemId];
            let startIndex = -1;
            let endIndex = -1;
            predecessors.forEach(p => {
                process(p);
                startIndex = teamIterations.findIndex(i => i.id === result[p].endIteration.id) + 1;
            });

            // 3. choose min start , max end date of children
            let minChildStart = teamIterations.length;
            let maxChildEnd = -1;
            let kind = IterationDurationKind.Predecessors;
            children.forEach(c => {
                const childStart = teamIterations.findIndex(i => i.id === result[c].startIteration.id);
                const childEnd = teamIterations.findIndex(i => i.id === result[c].endIteration.id);
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
                kind = IterationDurationKind.ChildRollup;
                startIndex = minChildStart;
            }
            if (endIndex < maxChildEnd) {
                endIndex = maxChildEnd;
            }

            // 4. choose self's iteration
            if (startIndex === -1) {
                kind = IterationDurationKind.Self;
                const workItem = pagedWorkItems[workItemId];
                const iterationPath = workItem.fields["System.IterationPath"];
                startIndex = endIndex = teamIterations.findIndex(itr => itr.path === iterationPath);
            }

            result[workItemId] = {
                startIteration: startIndex >= 0 ? teamIterations[startIndex] : null,
                endIteration: endIndex >= 0 ? teamIterations[endIndex] : null,
                kind
            }
        }
    };

    process(0);

    return result;
}