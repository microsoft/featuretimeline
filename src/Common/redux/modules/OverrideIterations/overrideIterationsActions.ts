import { IOverriddenIterationDuration } from "./overriddenIterationContracts";
import { createAction, ActionsUnion } from "../../Helpers/ActionHelper";

export const SetOverrideIterationType = "@@workitems/setoverrideiteration";
export const ClearOverrideIterationType = "@@overrideIteration/cleareoverrideiteration";
export const RestoreOverrideIterationType = "@@overrideIteration/restoreeoverrideiteration";


export const OverriddenIterationsActionCreator = {
    set: (workItemId: number, details: IOverriddenIterationDuration) =>
        createAction(SetOverrideIterationType, {
            workItemId,
            details
        }),
    clear: (workItemId: number) =>
        createAction(ClearOverrideIterationType, {
            workItemId
        }),
    restore: (details: IDictionaryNumberTo<IOverriddenIterationDuration>) =>
        createAction(RestoreOverrideIterationType, {
            details
        })

}

export type OverriddenIterationActions = ActionsUnion<typeof OverriddenIterationsActionCreator>;