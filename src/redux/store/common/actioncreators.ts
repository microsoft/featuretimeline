import { ActionCreator } from 'redux';
import {
    InitializeAction, InitializeType, ShowDetailsAction,
    ShowDetailsType, CloseDetailsAction, CloseDetailsType,
    ResetAction, ResetType,
    TogglePlanFeaturesPaneAction, TogglePlanFeaturesPaneType, ToggleFeatureStateAction, ToggleFeatureStateType, PlanFeaturesPaneWidthChangedAction, PlanFeaturesPaneFilterChangedAction, PlanFeaturesPaneFilterChangedType, PlanFeaturesPaneWidthChangedType, ToggleShowWorkItemDetailsAction, ToggleShowWorkitemDetailsType, ChangeProgressTrackingCriteriaAction, ChangeProgressTrackingCriteriaType
} from './actions';
import { ProgressTrackingCriteria } from '../types';

export const resetAllData: ActionCreator<ResetAction> = () => ({
    type: ResetType,
    payload: null
});

export const createInitialize: ActionCreator<InitializeAction> =
    (projectId: string, teamId: string, backlogLevelName: string) => ({
        type: InitializeType,
        payload: {
            projectId,
            teamId,
            backlogLevelName
        }
    });

export const showDetails: ActionCreator<ShowDetailsAction> =
    (id: number) => ({
        type: ShowDetailsType,
        payload: { id }
    });


export const closeDetails: ActionCreator<CloseDetailsAction> =
    (id: number) => ({
        type: CloseDetailsType,
        payload: { id }
    });

export const togglePlanFeaturesPane: ActionCreator<TogglePlanFeaturesPaneAction> = (show: boolean) => ({
    type: TogglePlanFeaturesPaneType,
    payload: show
});

export const changePlanFeaturesWidth: ActionCreator<PlanFeaturesPaneWidthChangedAction> = (width: number) => ({
    type: PlanFeaturesPaneWidthChangedType,
    payload: width
});

export const changePlanFeaturesFilter: ActionCreator<PlanFeaturesPaneFilterChangedAction> = (filter: string) => ({
    type: PlanFeaturesPaneFilterChangedType,
    payload: filter
});


export const toggleFeatureState: ActionCreator<ToggleFeatureStateAction> = (featureName: string, isEnabled: boolean) => ({
    type: ToggleFeatureStateType,
    payload: {
        featureName,
        isEnabled
    }
});

export const toggleShowWorkItemDetails: ActionCreator<ToggleShowWorkItemDetailsAction> = (show: boolean) => ({
    type: ToggleShowWorkitemDetailsType,
    payload: show
});


export const changeProgressTrackingCriteria: ActionCreator<ChangeProgressTrackingCriteriaAction> = (criteria: ProgressTrackingCriteria) => ({
    type: ChangeProgressTrackingCriteriaType,
    payload: criteria
});
