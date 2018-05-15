import { ActionCreator } from 'redux';
import {
    InitializeAction, InitializeType, ShowDetailsAction,
    ShowDetailsType, CloseDetailsAction, CloseDetailsType,
    ResetAction, ResetType,
    ToggleProposedWorkItemsPaneAction, ToggleProposedWorkItemsPaneType, ToggleFeatureStateAction, ToggleFeatureStateType
} from './actions';

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

export const toggleProposedWorkItemsPane: ActionCreator<ToggleProposedWorkItemsPaneAction> = (show: boolean) => ({
    type: ToggleProposedWorkItemsPaneType,
    payload: show
})

export const toggleFeatureState: ActionCreator<ToggleFeatureStateAction> = (featureName: string, isEnabled: boolean) => ({
    type: ToggleFeatureStateType,
    payload: {
        featureName,
        isEnabled
    }
});