import {
  createAction,
  ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";

export const enum EpicTimelineActionTypes {
  UpdateMessage = "EpicTimeline/UpdateMessage",
  OpenAddEpicDialog = "EpicTimeline/OpenAddEpicDialog",
  CloseAddEpicDialog = "EpicTimeline/CloseAddEpicDialog"
}

export const EpicTimelineActions = {
  updateMessage: (message: string) =>
    createAction(EpicTimelineActionTypes.UpdateMessage, {
      message
    }),
  openAddEpicDialog: () =>
    createAction(EpicTimelineActionTypes.OpenAddEpicDialog),
  closeAddEpicDialog: () =>
    createAction(EpicTimelineActionTypes.CloseAddEpicDialog)
};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;
