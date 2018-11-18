import { createSelector } from 'reselect';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import { SavedOverriddenIteration } from '../../../Common/redux/modules/OverrideIterations/overriddenIterationContracts';
import { OverriddenIterationSelector } from '../../../Common/redux/modules/OverrideIterations/overriddenIterationsSelector';
import { teamIterationsSelector } from '../modules/teamIterations/teamIterationSelector';
import { normalizedDependencyTreeSelector } from './dependencyTreeSelector';
import { IEpicTree, normalizedEpicTreeSelector } from "./epicTreeSelector";
import { pagedWorkItemsMapSelector } from './workItemSelector';
import { IDependenciesTree } from '../modules/workItems/workItemContracts';
import { IIterationDuration, IterationDurationKind } from "../../../Common/redux/Contracts/IIterationDuration";
import { backogIterationsSelector } from '../modules/teamsettings/teamsettingsselector';
import { areChildrenOutOfBounds } from '../../../Common/redux/Helpers/areChildrenOutOfBounds';
import { IDictionaryNumberTo } from '../../../Common/redux/Contracts/types';

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
        let overridedBy = undefined;
        let kind = undefined;
        let startIteration = undefined;
        let endIteration = undefined;
        let kindMessage = "";
        if (overriddenIteration) {
            kind = IterationDurationKind.UserOverridden;
            startIteration = teamIterations.find(i => i.id === overriddenIteration.startIterationId);
            endIteration = teamIterations.find(i => i.id === overriddenIteration.endIterationId);
            overridedBy = overriddenIteration.user;
            kindMessage = "User specified start and end iteration.";
        } else {
            // 2. If any predecessor choose start iteration = Max(predecessor end iteration) +1

            // process predecessors to ensure we have them sorted out
            const predecessors = depTree.stop[workItemId] || [];
            let startIndexByPredecessors = -1;

            if (predecessors.length > 0) {
                predecessors.forEach(process);
                kind = IterationDurationKind.Predecessors;
                kindMessage = "Start/End iterations are calculated the predecessors of the work item.";
                predecessors
                    .filter(p => result[p].kind !== IterationDurationKind.BacklogIteration)
                    .forEach(p => {
                        const pIndex = teamIterations.findIndex(i => i.id === result[p].endIteration.id) + 1;
                        startIndexByPredecessors = pIndex > startIndexByPredecessors ? pIndex : startIndexByPredecessors;
                    });
            }

            // 3. choose min start , max end date of children
            let startIndexByChildren = startIndexByPredecessors;
            let endIndexByChildren = startIndexByPredecessors;
            children
                .filter(c => result[c].kind !== IterationDurationKind.BacklogIteration)
                .forEach(c => {
                    const childStart = teamIterations.findIndex(i => i.id === result[c].startIteration.id);
                    const childEnd = teamIterations.findIndex(i => i.id === result[c].endIteration.id);
                    // If any child starts before a predecessor most likely that child is not affected by the predecessor
                    // so we can choose child's start as parents start
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
                kindMessage = "Start/End iterations are calculated based on the iteration of the children.";
            }

            startIteration = teamIterations[startIndex];
            endIteration = teamIterations[endIndex];
        }

        const workItem = pagedWorkItems[workItemId];
        let workItemIteration = null;
        if (workItem) {
            let iterationPath = workItem.fields["System.IterationPath"];
            workItemIteration = teamIterations.find(itr => itr.path === iterationPath);
        }

        // Use fall backs if none of the above yield start end iteration
        if (!startIteration || !endIteration) {
            switch (kind) {
                case IterationDurationKind.ChildRollup: {
                    kindMessage = "Children iterations are not subscribed by the team. ";
                    break;
                }
                case IterationDurationKind.UserOverridden: {
                    kindMessage = "User specified iterations are not subscribed by the team. ";
                    break;
                }
                case IterationDurationKind.Predecessors: {
                    debugger;
                    kindMessage = "Predecessors iterations are not subscribed by the team. ";
                    break;
                }
            }

            // Use work item's own iteration as first fallback
            if (workItemIteration) {
                kindMessage = kindMessage + " Using work items own iteration.";
                kind = IterationDurationKind.Self;
                startIteration = endIteration = workItemIteration;
            } else {
                // Use backlog iteration as final fallback
                kindMessage = kindMessage + " Using backlog iteration.";
                startIteration = backlogIteration;
                endIteration = backlogIteration;
                kind = IterationDurationKind.BacklogIteration;
            }
        }

        let childrenAreOutofBounds = false;
        children
            .forEach(c => {
                childrenAreOutofBounds = childrenAreOutofBounds ||
                    areChildrenOutOfBounds(startIteration, endIteration, result[c], teamIterations);
            });


        result[workItemId] = {
            startIteration,
            endIteration,
            kind,
            kindMessage,
            overridedBy: kind === IterationDurationKind.UserOverridden ? overridedBy : undefined,
            childrenAreOutofBounds
        }

        console.log("workItemStartEndIteration", workItemId, workItem, result[workItemId]);

    };

    process(0);

    return result;
}
