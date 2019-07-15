import { createAction, ActionsUnion } from "../Helpers";
import { ProgressTrackingCriteria, IAddItems, IRemoveItem, LoadingStatus } from "../../Contracts";
import moment = require("moment");
import { PortfolioPlanningFullContentQueryResult } from "../../Models/PortfolioPlanningQueryModels";
import { Action } from "redux";

export const enum EpicTimelineActionTypes {
    // TODO: May update these date change actions to be single actio
    UpdateStartDate = "EpicTimeline/UpdateStartDate",
    UpdateEndDate = "EpicTimeline/UpdateEndDate",
    ShiftItem = "EpicTimeline/ShiftItem",
    ToggleItemDetailsDialogHidden = "EpicTimeline/ToggleItemDetailsDialogHidden",
    SetSelectedItemId = "EpicTimeline/SetSelectedItemId",
    PortfolioItemsReceived = "EpicTimeline/PortfolioItemsReceived",
    PortfolioItemDeleted = "EpicTimeline/PortfolioItemDeleted",
    OpenAddItemPanel = "EpicTimeline/OpenAddItemPanel",
    CloseAddItemPanel = "EpicTimeline/CloseAddItemPanel",
    AddItems = "EpicTimeline/AddItems",
    RemoveItems = "EpicTimeline/RemoveItems",
    ToggleProgressTrackingCriteria = "EpicTimeline/ToggleProgressTrackingCriteria",
    ToggleLoadingStatus = "EpicTimeline/ToggleLoadingStatus",
    ResetPlanState = "EpicTimeline/ResetPlanState",
    TogglePlanSettingsPanelOpen = "EpicTimeline/TogglePlanSettingsPanelOpen",
    UpdateVisibleTimeStart = "EpicTimeline/UpdateVisibleTimeStart",
    UpdateVisibleTimeEnd = "EpicTimeline/UpdateVisibleTimeEnd",
    ToggleIsNewPlanExperience = "EpicTimeline/IsNewPlanExperience",
    ToggleDeletePlanDialogHidden = "EpicTimeline/ToggleDeletePlanDialogHidden",
    HandleGeneralException = "EpicTimeline/HandleGeneralException",
    DismissErrorMessageCard = "EpicTimeline/DismissErrorMessageCard"
}

export const EpicTimelineActions = {
    updateStartDate: (epicId: number, startDate: moment.Moment) =>
        createAction(EpicTimelineActionTypes.UpdateStartDate, {
            epicId,
            startDate
        }),
    updateEndDate: (epicId: number, endDate: moment.Moment) =>
        createAction(EpicTimelineActionTypes.UpdateEndDate, {
            epicId,
            endDate
        }),
    shiftItem: (itemId: number, startDate: moment.Moment) =>
        createAction(EpicTimelineActionTypes.ShiftItem, { itemId, startDate }),
    toggleItemDetailsDialogHidden: (hidden: boolean) =>
        createAction(EpicTimelineActionTypes.ToggleItemDetailsDialogHidden, {
            hidden
        }),
    setSelectedItemId: (id: number) => createAction(EpicTimelineActionTypes.SetSelectedItemId, { id }),
    portfolioItemsReceived: (result: PortfolioPlanningFullContentQueryResult) =>
        createAction(EpicTimelineActionTypes.PortfolioItemsReceived, result),
    portfolioItemDeleted: (itemDeleted: IRemoveItem) =>
        createAction(EpicTimelineActionTypes.PortfolioItemDeleted, itemDeleted),
    openAddItemPanel: () => createAction(EpicTimelineActionTypes.OpenAddItemPanel),
    closeAddItemPanel: () => createAction(EpicTimelineActionTypes.CloseAddItemPanel),
    addItems: (itemsToAdd: IAddItems) => createAction(EpicTimelineActionTypes.AddItems, itemsToAdd),
    removeItems: (itemToRemove: IRemoveItem) => createAction(EpicTimelineActionTypes.RemoveItems, itemToRemove),
    toggleProgressTrackingCriteria: (criteria: ProgressTrackingCriteria) =>
        createAction(EpicTimelineActionTypes.ToggleProgressTrackingCriteria, {
            criteria
        }),
    toggleLoadingStatus: (status: LoadingStatus) =>
        createAction(EpicTimelineActionTypes.ToggleLoadingStatus, { status }),
    resetPlanState: () => createAction(EpicTimelineActionTypes.ResetPlanState),
    togglePlanSettingsPanelOpen: (isOpen: boolean) =>
        createAction(EpicTimelineActionTypes.TogglePlanSettingsPanelOpen, { isOpen }),
    updateVisibleTimeStart: (visibleTimeStart: number) =>
        createAction(EpicTimelineActionTypes.UpdateVisibleTimeStart, {
            visibleTimeStart
        }),
    updateVisibleTimeEnd: (visibleTimeEnd: number) =>
        createAction(EpicTimelineActionTypes.UpdateVisibleTimeEnd, {
            visibleTimeEnd
        }),
    toggleIsNewPlanExperience: (isNewPlanExperience: boolean) =>
        createAction(EpicTimelineActionTypes.ToggleIsNewPlanExperience, { isNewPlanExperience }),
    toggleDeletePlanDialogHidden: (hidden: boolean) =>
        createAction(EpicTimelineActionTypes.ToggleDeletePlanDialogHidden, { hidden }),
    handleGeneralException: (exception: Error) =>
        createAction(EpicTimelineActionTypes.HandleGeneralException, exception),
    dismissErrorMessageCard: () => createAction(EpicTimelineActionTypes.DismissErrorMessageCard)
};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;

export interface PortfolioItemsReceivedAction extends Action {
    type: EpicTimelineActionTypes.PortfolioItemsReceived;
    payload: PortfolioPlanningFullContentQueryResult;
}

export interface PortfolioItemDeletedAction extends Action {
    type: EpicTimelineActionTypes.PortfolioItemDeleted;
    payload: IRemoveItem;
}
