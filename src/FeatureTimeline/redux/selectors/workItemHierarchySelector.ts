import { getWorkItemsForLevel } from './workItemsForLevel';
import { IFeatureTimelineRawState, IIterationDuration, IterationDurationKind } from '../store/types';
import { IWorkItemInfo, WorkItemLevel, StateCategory } from '../store/workitems/types';
import { WorkItem, WorkItemStateColor } from 'TFS/WorkItemTracking/Contracts';
import { compareIteration } from '../../../Common/Helpers/iterationComparer';
import { getTeamIterations } from './teamIterations';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { UIStatus } from '../../../Common/Contracts/types';
import { IWorkItemDisplayDetails } from '../../../Common/Contracts/GridViewContracts';


export enum FeatureFilter {
    None,
    InProgress,
    WithoutIteration
}

export function getEpicHierarchy(projectId: string,
    teamId: string,
    uiStatus: UIStatus,
    input: IFeatureTimelineRawState,
    featureFilter: FeatureFilter): IWorkItemDisplayDetails[] {

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
    const inProgressFilter = (feature: IWorkItemDisplayDetails) => workItemInfos[feature.id].stateCategory === StateCategory.InProgress;

    // include only features that have explicit iteration
    const explicitIterationFilter = (feature: IWorkItemDisplayDetails) => feature.iterationDuration.kind !== IterationDurationKind.BacklogIteration;

    let filter = (feature: IWorkItemDisplayDetails) => true;
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
    input: IFeatureTimelineRawState): IWorkItemDisplayDetails[] {

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
    isRoot: boolean): IWorkItemDisplayDetails {

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
    const effortFieldName = input.backlogConfiguration.backlogConfigurations[projectId][teamId].backlogFields.typeFields["Effort"];
    const color = workItemType ? "#" + (workItemType.color.length > 6 ? workItemType.color.substr(2) : workItemType.color) : "#c2c8d1";
    const workItemDetails = {
        id,
        title: workItem ? workItem.fields["System.Title"] : "Unparented",
        color,
        order: workItem ? workItem.fields[orderFieldName] : 0,
        efforts: workItem ? workItem.fields[effortFieldName] || 0 : 0,
        workItem,
        iterationDuration,
        children,
        isRoot,
        showInfoIcon: !isRoot && (iterationDuration.kind === IterationDurationKind.ChildRollup || iterationDuration.kind === IterationDurationKind.UserOverridden),
        isComplete: workItemInfo && workItemInfo.stateCategory === StateCategory.Completed,
        workItemStateColor,
        childrenWithNoEfforts: children.filter(c => c.efforts === 0).length
    };

    return workItemDetails;
}

function getWorkItemsDetails(
    projectId: string,
    teamId: string,
    ids: number[],
    input: IFeatureTimelineRawState,
    isEpic: boolean): IWorkItemDisplayDetails[] {

    return ids.map(id => getWorkItemDetails(projectId, teamId, id, input, isEpic));
}

function getWorkItemIterationDuration(
    children: IWorkItemDisplayDetails[],
    projectId: string,
    teamId: string,
    input: IFeatureTimelineRawState,
    id: number,
    workItem: WorkItem) {

    let iterationDuration = getIterationDurationFromChildren(children);

    const allIterations = getTeamIterations(projectId, teamId, UIStatus.Default, input);

    const teamSettings = input.teamSetting.teamSetting[projectId][teamId];

    // if the start/end iteration is overridden use that value
    if (input.savedOverriddenIterations &&
        input.savedOverriddenIterations[id]) {
        const si = input.savedOverriddenIterations[id].startIterationId;
        const ei = input.savedOverriddenIterations[id].endIterationId;
        const overridedBy = input.savedOverriddenIterations[id].user;
        const startIteration = allIterations.find(i => i.id === si);
        const endIteration = allIterations.find(i => i.id === ei);

        if (startIteration && endIteration) {
            const childrenAreOutofBounds = areChildrenOutOfBounds(startIteration, endIteration, iterationDuration, allIterations);
            iterationDuration = { startIteration, endIteration, kind: IterationDurationKind.UserOverridden, overridedBy, childrenAreOutofBounds };
        }
    }

    // if null use workItems start/end iteration
    if (workItem && (!iterationDuration.startIteration || !iterationDuration.endIteration)) {
        const iterationPath = workItem.fields["System.IterationPath"];
        const iteration = allIterations.find((i) => i.path === iterationPath);
        iterationDuration.startIteration = iteration;
        iterationDuration.endIteration = iteration;
        iterationDuration.kind = IterationDurationKind.Self;
    }

    // If still null take currentIteration
    if (!iterationDuration.startIteration || !iterationDuration.endIteration) {
        iterationDuration.startIteration = teamSettings.backlogIteration;
        iterationDuration.endIteration = teamSettings.backlogIteration;
        iterationDuration.kind = IterationDurationKind.BacklogIteration;
    }
    return iterationDuration;
}

function getIterationDurationFromChildren(
    children: IWorkItemDisplayDetails[]): IIterationDuration {

    return children.reduce((prev, child) => {
        let {
            startIteration,
            endIteration
        } = prev;
        // Use child iteration only if it is explicit derived
        if (child.iterationDuration.kind !== IterationDurationKind.BacklogIteration) {
            if ((!startIteration || !endIteration)) {
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
        }
        return {
            startIteration,
            endIteration,
            kind: !startIteration ? IterationDurationKind.BacklogIteration : IterationDurationKind.ChildRollup
        }
    }, { startIteration: null, endIteration: null, kind: IterationDurationKind.BacklogIteration });
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

function areChildrenOutOfBounds(
    start: TeamSettingsIteration,
    end: TeamSettingsIteration,
    iterationDuration: IIterationDuration,
    allIterations: TeamSettingsIteration[]): boolean {
    if (iterationDuration.kind === IterationDurationKind.BacklogIteration || !start || !end) {
        return false;
    }

    const startIndex = allIterations.findIndex(itr => itr.id == start.id);
    const endIndex = allIterations.findIndex(itr => itr.id == end.id);

    const childStartIndex = allIterations.findIndex(itr => itr.id == iterationDuration.startIteration.id);
    const childEndIndex = allIterations.findIndex(itr => itr.id == iterationDuration.endIteration.id);

    return childStartIndex < startIndex || childEndIndex > endIndex;
}