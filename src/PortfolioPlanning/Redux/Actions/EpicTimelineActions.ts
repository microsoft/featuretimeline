import {
    createAction,
    ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";

export const enum EpicTimelineActionTypes {
    UpdateMessage = "EpicTimeline/UpdateMessage"
}

export const EpicTimelineActions = {
    updateMessage: (message: string) =>
        createAction(EpicTimelineActionTypes.UpdateMessage, {
            message
        })
};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;
