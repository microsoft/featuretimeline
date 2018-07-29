import { WorkItemLink, WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { ActionsUnion, createAction } from '../../../../Common/redux/Helpers/ActionHelper';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { StartUpdateWorkitemIterationActionType } from '../../../../Common/redux/actions/StartUpdateWorkitemIterationAction';

export const EpicHierarchyReceivedType = "@@workitems/EpicHierarchyReceived";
export const DependenciesReceivedType = "@@workitems/DependenciesReceived";
export const PagedWorkItemsReceivedType = "@@workitems/PagedWorkItemsReceived";

export interface IStartUpdateWorkItemIterationPayload {
    workItem: number[];
    teamIteration: TeamSettingsIteration;
    override: boolean;
}

export const WorkItemsActionCreator = {
    epicHierarchyReceived: (links: WorkItemLink[]) =>
        createAction(EpicHierarchyReceivedType, {
            links
        }),
    dependenciesReceived: (links: WorkItemLink[]) =>
        createAction(DependenciesReceivedType, {
            links
        }),
    pagedWorkItemsReceived: (workItems: WorkItem[]) =>
        createAction(PagedWorkItemsReceivedType, {
            workItems
        }),
    startUpdateWorkItemIteration: (workItem: number[], teamIteration: TeamSettingsIteration, override: boolean) =>
        createAction(StartUpdateWorkitemIterationActionType,
            {
                workItem,
                teamIteration,
                override
            })


}

export type WorkItemsActions = ActionsUnion<typeof WorkItemsActionCreator>;