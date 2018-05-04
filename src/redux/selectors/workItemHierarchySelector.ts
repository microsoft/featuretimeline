import { getWorkItemsForLevel } from './workItemsForLevel';
import { IFeatureTimelineRawState, IIterationDuration, IterationDurationKind } from '../store';
import { IWorkItemInfo, WorkItemLevel } from '../store/workitems/types';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { UIStatus } from '../types';
import { compareIteration, getCurrentIterationIndex } from '../helpers/iterationComparer';

export interface IWorkItemHierarchy {
    id: number;
    title: string;
    color: string;
    isRoot: boolean;
    workItem: WorkItem;
    order: number;
    iterationDuration: IIterationDuration;
    children: IWorkItemHierarchy[];
    shouldShowDetails: boolean;
}

export function getWorkItemHierarchy(
    projectId: string,
    teamId: string,
    uiStatus: UIStatus,
    input: IFeatureTimelineRawState): IWorkItemHierarchy[] {

    if (uiStatus !== UIStatus.Default) {
        return [];
    }

    const {
        workItemsState
    } = input;

    // Fetch work items at parent level
    const epicIds = getWorkItemsForLevel(workItemsState.workItemInfos, WorkItemLevel.Parent);

    // Add unparent level as parent
    epicIds.unshift(0);

    return getWorkItemsDetails(projectId, teamId, epicIds, input, /* isRoot */ true);
}

function getWorkItemsDetails(projectId: string, teamId: string, ids: number[], input: IFeatureTimelineRawState, isRoot: boolean): IWorkItemHierarchy[] {
    return ids.map(id => getWorkItemDetails(projectId, teamId, id, input, isRoot));
}

function getWorkItemDetails(projectId: string, teamId: string, id: number, input: IFeatureTimelineRawState, isRoot: boolean): IWorkItemHierarchy {
    const {
        workItemsState,
        workItemMetadata
    } = input;


    const workItem = id && workItemsState.workItemInfos[id].workItem;
    let workItemType = null;

    if (workItem) {
        const workItemTypeName = workItem.fields["System.WorkItemType"];
        workItemType = workItemMetadata.metadata[projectId].workItemTypes.filter((wit) => wit.name.toLowerCase() === workItemTypeName.toLowerCase())[0];
    }

    const children = getWorkItemsDetails(projectId, teamId, getChildrenId(workItemsState.workItemInfos, id), input, /* isRoot */ false);

    // try getting start/end iteration from children
    let iterationDuration = getIterationDurationFromChildren(children);
    const iterations = getIterations(projectId, teamId, input);

    // TODO: We will use the dropdown option value when available to toggle use overridden value or not
    // if the start/end iteration is overridden use that value
    if (input.savedOverriddenWorkItemIterations &&
        input.savedOverriddenWorkItemIterations[id]) {
        const si = input.savedOverriddenWorkItemIterations[id].startIterationId;
        const ei = input.savedOverriddenWorkItemIterations[id].endIterationId;
        const overridedBy = input.savedOverriddenWorkItemIterations[id].user;

        const startIteration = iterations.find(i => i.id === si);
        const endIteration = iterations.find(i => i.id === ei);
        if (startIteration && endIteration) {
            iterationDuration = { startIteration, endIteration, kind: IterationDurationKind.UserOverridden, overridedBy };

        }
    }

    // if null use workItems start/end iteration
    if (workItem && (!iterationDuration.startIteration || !iterationDuration.endIteration)) {
        const iterationPath = workItem.fields["System.IterationPath"];
        const iteration = iterations.find((i) => i.path === iterationPath);

        iterationDuration.startIteration = iteration;
        iterationDuration.endIteration = iteration;
    }

    // If still null take currentIteration
    const allIterations = getIterations(projectId, teamId, input);
    const currentIteration = allIterations[getCurrentIterationIndex(allIterations)];
    if (!iterationDuration.startIteration || !iterationDuration.endIteration) {
        iterationDuration.startIteration = currentIteration;
        iterationDuration.endIteration = currentIteration;
        iterationDuration.kind = IterationDurationKind.CurrentIteration;
    }

    const orderFieldName = input.backlogConfiguration.backlogConfigurations[projectId][teamId].backlogFields.typeFields["Order"];
    const color = workItemType ? "#" + (workItemType.color.length > 6 ? workItemType.color.substr(2) : workItemType.color) : "#c2c8d1";
    const workItemDetails = {
        id,
        title: workItem ? workItem.fields["System.Title"] : "Unparented",
        color,
        order: workItem ? workItem.fields[orderFieldName] : 0,
        workItem,
        iterationDuration,
        children,
        isRoot,
        shouldShowDetails: !isRoot && (iterationDuration.kind === IterationDurationKind.ChildRollup || iterationDuration.kind === IterationDurationKind.UserOverridden)
    };

    return workItemDetails;
}

function getIterationDurationFromChildren(children: IWorkItemHierarchy[]): IIterationDuration {
    return children.reduce((prev, child) => {
        let {
            startIteration,
            endIteration
        } = prev;

        if (!startIteration || !endIteration) {
            startIteration = child.iterationDuration.startIteration;
            endIteration = child.iterationDuration.endIteration;
        } else {
            if (compareIteration(child.iterationDuration.startIteration , startIteration) < 0) {
                startIteration = child.iterationDuration.startIteration;
            }

            if (compareIteration(child.iterationDuration.endIteration, endIteration) > 0) {
                endIteration = child.iterationDuration.endIteration;
            }
        }
        return {
            startIteration,
            endIteration,
            kind: IterationDurationKind.ChildRollup
        }
    }, { startIteration: null, endIteration: null, kind: IterationDurationKind.None });
}

function getIterations(projectId: string, teamId: string, input: IFeatureTimelineRawState) {
    if (!input ||
        !input.iterationState ||
        !input.iterationState.teamSettingsIterations ||
        !input.iterationState.teamSettingsIterations[projectId] ||
        !input.iterationState.teamSettingsIterations[projectId][teamId]) {

        return [];
    }
    return input.iterationState.teamSettingsIterations[projectId][teamId];
}

function getChildrenId(workItemInfos: IDictionaryNumberTo<IWorkItemInfo>, parentId: number): number[] {
    const childIds = [];
    for (const key in workItemInfos) {
        const workItem = workItemInfos[key];
        if (workItem.parent === parentId && workItem.level !== WorkItemLevel.Parent) {
            childIds.push(workItem.workItem.id);
        }
    }
    return childIds;
}