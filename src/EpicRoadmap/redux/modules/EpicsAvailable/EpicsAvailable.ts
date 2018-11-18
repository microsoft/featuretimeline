import produce from 'immer';
import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import { ActionsUnion, createAction } from '../../../../Common/redux/Helpers/ActionHelper';

export interface IEpicsAvailableState {
    epics: WorkItem[];
}

export interface IEpicsAvailableAwareState {
    epicsAvailableState: IEpicsAvailableState;
}

export const EpicsAvailableType = "@@EpicsAvailable/EpicsAvailable";
export const EpicsAvailableCreator = {
    epicsReceiveed: (workItems: WorkItem[]) =>
        createAction(EpicsAvailableType, {
            workItems
        })
}

export type EpicsAvailableActions = ActionsUnion<typeof EpicsAvailableCreator>;

export function epicsAvailableReducer(state: IEpicsAvailableState, action: EpicsAvailableActions): IEpicsAvailableState {
    state = state || { epics: undefined };
    return produce(state, draft => {
        switch (action.type) {
            case EpicsAvailableType:
                draft.epics = action.payload.workItems;
                break;
        }
    });
}