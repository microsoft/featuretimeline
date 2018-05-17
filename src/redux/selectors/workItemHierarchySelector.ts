import { getWorkItemsForLevel } from './workItemsForLevel';
import { IFeatureTimelineRawState, IIterationDuration, IterationDurationKind } from '../store';
import { IWorkItemInfo, WorkItemLevel, StateCategory } from '../store/workitems/types';
import { WorkItem, WorkItemStateColor } from 'TFS/WorkItemTracking/Contracts';
import { UIStatus } from '../types';
import { compareIteration, getCurrentIterationIndex } from '../helpers/iterationComparer';
import { getTeamIterations } from './teamIterations';


export interface IWorkItemHierarchy {
    id: number;
    title: string;
    color: string;
    workItemStateColor: WorkItemStateColor;
    isRoot: boolean;
    workItem: WorkItem;
    order: number;
    iterationDuration: IIterationDuration;
    children: IWorkItemHierarchy[];
    shouldShowDetails: boolean;
    isComplete: boolean;
}

export enum FeatureFilter {
    None,
    InProgress,
    WithoutIteration
}

export function getEpicHierarchy(projectId: string,
    teamId: string,
    uiStatus: UIStatus,
    input: IFeatureTimelineRawState,
    featureFilter: FeatureFilter): IWorkItemHierarchy[] {

    if (uiStatus !== UIStatus.Default) {
        return [];
    }

    const epics = getEpicHierarchyInternal(projectId, teamId, uiStatus, input)
    const {
        workItemsState
    } = input;
    const {
        workItemInfos
    } = workItemsState;

    // include only InProgress work items
    const inProgressFilter = (feature: IWorkItemHierarchy) => workItemInfos[feature.id].stateCategory === StateCategory.InProgress;

    // include only features that have explicit iteration
    const explicitIterationFilter = (feature: IWorkItemHierarchy) => feature.iterationDuration.kind !== IterationDurationKind.CurrentIteration;

    let filter = (feature: IWorkItemHierarchy) => true;
    if (featureFilter === FeatureFilter.InProgress) {
        filter = inProgressFilter;
    } else if (featureFilter === FeatureFilter.WithoutIteration) {
        filter = explicitIterationFilter;
    }

    // Filter only inprogress features
    epics.forEach(epic => epic.children = epic.children.filter(filter));

    // Return only those epics that have one or more children
    return epics.filter(e => e.children.length > 0);
}

function getEpicHierarchyInternal(
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
    const epicIds = getWorkItemsForLevel(workItemsState.workItemInfos, WorkItemLevel.Parent, null);

    // Add unparent level as parent
    epicIds.unshift(0);

    return getWorkItemsDetails(projectId, teamId, epicIds, input, /* isRoot */ true);
}

function getWorkItemDetails(
    projectId: string,
    teamId: string,
    id: number,
    input: IFeatureTimelineRawState,
    isRoot: boolean): IWorkItemHierarchy {

    const {
        workItemsState,
        workItemMetadata
    } = input;

    const workItemInfo = id && workItemsState.workItemInfos[id];
    const workItem = workItemInfo && workItemInfo.workItem;
    let workItemType = null;
    let workItemStateColor: WorkItemStateColor = null;
    
    if (workItem) {
        const workItemTypeName = workItem.fields["System.WorkItemType"];
        const state = workItem.fields["System.State"].toLowerCase();
        const metadata = workItemMetadata.metadata[projectId];
        workItemType = metadata.workItemTypes.filter((wit) => wit.name.toLowerCase() === workItemTypeName.toLowerCase())[0];
        if (metadata.workItemStateColors[workItemTypeName]) {
            workItemStateColor = metadata.workItemStateColors[workItemTypeName].filter(sc => sc.name.toLowerCase() === state)[0];
        }
    }

    const children = getWorkItemsDetails(projectId, teamId, getChildrenIds(workItemsState.workItemInfos, id), input, /* isRoot */ false);

    // try getting start/end iteration from children
    let iterationDuration = getWorkItemIterationDuration(children, projectId, teamId, input, id, workItem);

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
        shouldShowDetails: !isRoot && (iterationDuration.kind === IterationDurationKind.ChildRollup || iterationDuration.kind === IterationDurationKind.UserOverridden),
        isComplete: workItemInfo && workItemInfo.stateCategory === StateCategory.Completed,
        workItemStateColor
    };

    return workItemDetails;
}

function getWorkItemsDetails(
    projectId: string,
    teamId: string,
    ids: number[],
    input: IFeatureTimelineRawState,
    isEpic: boolean): IWorkItemHierarchy[] {

    return ids.map(id => getWorkItemDetails(projectId, teamId, id, input, isEpic));
}

function getWorkItemIterationDuration(
    children: IWorkItemHierarchy[],
    projectId: string,
    teamId: string,
    input: IFeatureTimelineRawState,
    id: number,
    workItem: WorkItem) {

    let iterationDuration = getIterationDurationFromChildren(children);
    const allIterations = getTeamIterations(projectId, teamId, UIStatus.Default, input);

    // if the start/end iteration is overridden use that value
    if (input.savedOverriddenWorkItemIterations &&
        input.savedOverriddenWorkItemIterations[id]) {
        const si = input.savedOverriddenWorkItemIterations[id].startIterationId;
        const ei = input.savedOverriddenWorkItemIterations[id].endIterationId;
        const overridedBy = input.savedOverriddenWorkItemIterations[id].user;
        const startIteration = allIterations.find(i => i.id === si);
        const endIteration = allIterations.find(i => i.id === ei);
        if (startIteration && endIteration) {
            iterationDuration = { startIteration, endIteration, kind: IterationDurationKind.UserOverridden, overridedBy };
        }
    }

    // if null use workItems start/end iteration
    if (workItem && (!iterationDuration.startIteration || !iterationDuration.endIteration)) {
        const iterationPath = workItem.fields["System.IterationPath"];
        const iteration = allIterations.find((i) => i.path === iterationPath);
        iterationDuration.startIteration = iteration;
        iterationDuration.endIteration = iteration;
    }

    // If still null take currentIteration
    const currentIteration = allIterations[getCurrentIterationIndex(allIterations)];
    if (!iterationDuration.startIteration || !iterationDuration.endIteration) {
        iterationDuration.startIteration = currentIteration;
        iterationDuration.endIteration = currentIteration;
        iterationDuration.kind = IterationDurationKind.CurrentIteration;
    }
    return iterationDuration;
}

function getIterationDurationFromChildren(
    children: IWorkItemHierarchy[]): IIterationDuration {

    return children.reduce((prev, child) => {
        let {
            startIteration,
            endIteration
        } = prev;

        if (!startIteration || !endIteration) {
            startIteration = child.iterationDuration.startIteration;
            endIteration = child.iterationDuration.endIteration;
        } else {
            if (compareIteration(child.iterationDuration.startIteration, startIteration) < 0) {
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

function getChildrenIds(
    workItemInfos: IDictionaryNumberTo<IWorkItemInfo>,
    parentId: number): number[] {

    const childIds = [];
    for (const key in workItemInfos) {
        const workItem = workItemInfos[key];
        if (!workItem) {
            console.log(`Invalid workitem id: ${key}`);
        }

        if (workItem
            && workItem.parent === parentId
            && workItem.level !== WorkItemLevel.Parent) {
            childIds.push(workItem.workItem.id);
        }
    }
    return childIds;
}