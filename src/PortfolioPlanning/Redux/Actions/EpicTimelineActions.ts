import {
  createAction,
  ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";
import { IEpic } from "../../Contracts";

export const enum EpicTimelineActionTypes {
  UpdateMessage = "EpicTimeline/UpdateMessage",
  OpenAddEpicDialog = "EpicTimeline/OpenAddEpicDialog",
  CloseAddEpicDialog = "EpicTimeline/CloseAddEpicDialog",
  AddEpics = "EpicTimeline/AddEpics"
}

export const EpicTimelineActions = {
  updateMessage: (message: string) =>
    createAction(EpicTimelineActionTypes.UpdateMessage, {
      message
    }),
  openAddEpicDialog: () =>
    createAction(EpicTimelineActionTypes.OpenAddEpicDialog),
  closeAddEpicDialog: () =>
    createAction(EpicTimelineActionTypes.CloseAddEpicDialog),
  addEpics: (epicsToAdd: IEpic[]) => 
    createAction(EpicTimelineActionTypes.AddEpics, {epicsToAdd})
};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;
