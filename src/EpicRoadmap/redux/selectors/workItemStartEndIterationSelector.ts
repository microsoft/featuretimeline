import { createSelector } from 'reselect';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { SavedOverriddenIteration } from '../../../Common/redux/modules/OverrideIterations/overriddenIterationContracts';
import { OverriddenIterationSelector } from '../../../Common/redux/modules/OverrideIterations/overriddenIterationsSelector';
import { teamIterationsSelector } from '../modules/teamIterations/teamIterationSelector';
import { normalizedDependencyTreeSelector } from './dependencyTreeSelector';
import { IEpicTree, normalizedEpicTreeSelector } from "./epicTreeSelector";
import { pagedWorkItemsMapSelector } from './workItemSelector';
import { IDependenciesTree } from '../modules/workItems/workItemContracts';
import { IIterationDuration, IterationDurationKind } from "../../../Common/redux/Contracts/IIterationDuration";
import { backogIterationsSelector } from '../modules/teamsettings/teamsettingsselector';

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
    backogIterationsSelector as any,
    pagedWorkItemsMapSelector as any,
    getWorkItemIterationDuration
);

export function getWorkItemIterationDuration(
    epicTree: IEpicTree,
    depTree: IDependenciesTree,
    overriddenIterations: SavedOverriddenIteration,
    teamIterations: TeamSettingsIteration[],
    backlogIteration: TeamSettingsIteration,
    pagedWorkItems: IDictionaryNumberTo<WorkItem>): WorkItemStartEndIteration {

    const result: WorkItemStartEndIteration = {};
    teamIterations = teamIterations || [];

    if (teamIterations.length === 0 || Object.keys(pagedWorkItems).length === 0) {
        return {};
    }

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
            let startIteration = null;
            let endIteration = null;

            if (overriddenIteration.startIterationId === backlogIteration.id) {
                startIteration = backlogIteration;
            } else {
                startIteration = teamIterations.find(i => i.id === overriddenIteration.startIterationId);
            }

            if (overriddenIteration.endIterationId === backlogIteration.id) {
                endIteration = backlogIteration;
            } else {
                endIteration = teamIterations.find(i => i.id === overriddenIteration.endIterationId);
            }

            let kind = IterationDurationKind.UserOverridden;

            if(!startIteration || !endIteration) {
                startIteration = backlogIteration;
                endIteration = backlogIteration;
                kind= IterationDurationKind.FallbackBacklogIteration_IterationOutOfScope;
            }
            result[workItemId] = {
                startIteration,
                endIteration,
                kind,
                overridedBy: overriddenIteration.user
            };
        } else {
            // 2. If any predecessor choose start iteration = Max(predecessor end iteration) +1
            // process predecessors to ensure we have them sorted out
            const predecessors = depTree.stop[workItemId] || [];
            let startIndexByPredecessors = -1;
            predecessors.forEach(process);

            predecessors
                .filter(p => result[p].kind !== IterationDurationKind.BacklogIteration)
                .forEach(p => {
                    const pIndex = teamIterations.findIndex(i => i.id === result[p].endIteration.id) + 1;
                    startIndexByPredecessors = pIndex > startIndexByPredecessors ? pIndex : startIndexByPredecessors;
                });

            // 3. choose min start , max end date of children
            let startIndexByChildren = startIndexByPredecessors;
            let endIndexByChildren = startIndexByPredecessors;
            let kind = IterationDurationKind.Predecessors;
            children
                .filter(c => result[c].startIteration && result[c].endIteration && result[c].kind !== IterationDurationKind.BacklogIteration)
                .forEach(c => {
                    const childStart = teamIterations.findIndex(i => i.id === result[c].startIteration.id);
                    const childEnd = teamIterations.findIndex(i => i.id === result[c].endIteration.id);
                    if (childStart < startIndexByChildren || startIndexByChildren === -1) {
                        startIndexByChildren = childStart;
                    }
                    if (childEnd > endIndexByChildren) {
                        endIndexByChildren = childEnd;
                    }
                });

            let startIndex = startIndexByChildren;
            let endIndex = endIndexByChildren;

            if (startIndexByChildren > startIndexByPredecessors) {
                kind = IterationDurationKind.ChildRollup;
                startIndex = startIndexByChildren;
            }

            const workItem = pagedWorkItems[workItemId];
            let iterationPath = "";
            if (workItem) {
                iterationPath = workItem.fields["System.IterationPath"];
            }
            // 4. choose self's iteration
            if (startIndex === -1) {
                const isInBacklogIteration = iterationPath === (backlogIteration.path || backlogIteration.name);
                if (isInBacklogIteration) {
                    kind = IterationDurationKind.BacklogIteration;
                    startIndex = -1;
                    endIndex = -1;
                } else {
                    kind = IterationDurationKind.Self;
                    startIndex = endIndex = teamIterations.findIndex(itr => itr.path === iterationPath);
                }
            }

            let startIteration = kind === IterationDurationKind.BacklogIteration ? backlogIteration : (startIndex >= 0 ? teamIterations[startIndex] : null);
            let endIteration = kind === IterationDurationKind.BacklogIteration ? backlogIteration : (endIndex >= 0 ? teamIterations[endIndex] : null);

            // If we have chosen the iteration based on the predessor but the team does not subscribe to that iteration
            if (kind == IterationDurationKind.Predecessors && (!startIteration || !endIteration)) {
                startIteration = endIteration = backlogIteration;
                kind = IterationDurationKind.FallbackBacklogIteration_PredecessorsOutofScope;
            }

            // For all other reasons we can not find the iteration the work item was suppsed to be so we are putting that in backlog iteration
            if (!startIteration || !endIteration) {
                debugger; // If you hit this please diagnose what that happens
                startIteration = endIteration = backlogIteration;
                kind = IterationDurationKind.FallbackBacklogIteration_IterationOutOfScope;
            }

            result[workItemId] = {
                startIteration,
                endIteration,
                kind
            }
        }
    };

    process(0);

    return result;
}