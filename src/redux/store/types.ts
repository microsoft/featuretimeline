import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { Action, Reducer, combineReducers } from 'redux';
import backlogConfigurationReducer from './backlogconfiguration/reducer';
import { IBacklogConfigurationState } from './backlogconfiguration/types';
import { ResetType } from './common/actions';
import featureStateReducer from './common/featureStateReducer';
import showHideDetailsReducer from "./common/reducer";
import settingsReducer from "./common/settingsReducer";
import togglePaneReducer from './common/togglePaneReducer';
import errorReducer from './error/reducer';
import loadingReducer from './loading/reducer';
import overrideIterationReducer from "./overrideIterationProgress/reducer";
import teamSettingReducer from './teamSettings/reducer';
import { ITeamSettingState } from './teamSettings/types';
import teamIterationsReducer from './teamiterations/reducer';
import { ITeamSettingsIterationState } from './teamiterations/types';
import metadataReducer from './workitemmetadata/reducer';
import { IWorkItemMetadataState } from './workitemmetadata/types';
import savedOverriddenWorkItemIterationsReducer from "./workitems/overrideWorkItemIterationReducer";
import workItemReducer from './workitems/reducer';
import { IWorkItemsState } from './workitems/types';


export interface IIterationDuration {
    startIteration: TeamSettingsIteration;
    endIteration: TeamSettingsIteration;
    kind: IterationDurationKind;
    overridedBy?: string; // User name for the case when kind is UserOverridden
    childrenAreOutofBounds?: boolean; // Indicates if the child work items has iterations that are out of bounds
}

export enum IterationDurationKind {
    BacklogIteration,
    Self,
    ChildRollup,
    UserOverridden
}

export enum ProgressTrackingCriteria {
    ChildWorkItems,
    EffortsField
}

export interface ISettingsState {
    showWorkItemDetails: boolean;
    progressTrackingCriteria: ProgressTrackingCriteria;
}

export interface IOverriddenIterationDuration {
    startIterationId: string;
    endIterationId: string;
    user: string;
}


export interface IWorkItemOverrideIteration {
    workItemId: number;
    iterationDuration: IOverriddenIterationDuration;
    changingStart: boolean; // Weather we are changing start iteration or end iteration
}

export interface IPlanFeaturesState {
    show: boolean;
    paneWidth: number;
    filter: string;
}

export interface IFeatureTimelineRawState {
    workItemsState: IWorkItemsState;
    workItemMetadata: IWorkItemMetadataState;
    iterationState: ITeamSettingsIterationState;
    error: string;
    backlogConfiguration: IBacklogConfigurationState;
    teamSetting: ITeamSettingState;
    loading: boolean;
    // This will contain any overridden iterations by the UI in extension storage
    savedOverriddenWorkItemIterations: IDictionaryNumberTo<IOverriddenIterationDuration>;

    // list of work item ids for which the details window is shown 
    workItemDetails: number[];

    workItemOverrideIteration?: IWorkItemOverrideIteration;
    planFeaturesState: IPlanFeaturesState;
    featureState: IDictionaryStringTo<boolean>;
    settingsState: ISettingsState;
}

const crossSliceReducer = (state: IFeatureTimelineRawState, action: Action): IFeatureTimelineRawState => {
    switch (action.type) {
        case ResetType: {
            return {
                workItemsState: undefined,
                workItemMetadata: undefined,
                iterationState: undefined,
                error: null,
                loading: false,
                backlogConfiguration: undefined,
                teamSetting: undefined,
                savedOverriddenWorkItemIterations: undefined,
                workItemDetails: undefined,
                workItemOverrideIteration: undefined
            } as IFeatureTimelineRawState;
        }
    }

    return state;
}

const intermediateReducer = combineReducers<IFeatureTimelineRawState>({
    workItemsState: workItemReducer,
    workItemMetadata: metadataReducer,
    iterationState: teamIterationsReducer,
    error: errorReducer,
    backlogConfiguration: backlogConfigurationReducer,
    teamSetting: teamSettingReducer,
    loading: loadingReducer,
    workItemDetails: showHideDetailsReducer,
    workItemOverrideIteration: overrideIterationReducer,
    savedOverriddenWorkItemIterations: savedOverriddenWorkItemIterationsReducer,
    planFeaturesState: togglePaneReducer,
    featureState: featureStateReducer,
    settingsState: settingsReducer
});

// setup reducers
export const reducers: Reducer<IFeatureTimelineRawState> = (state: IFeatureTimelineRawState, action: Action) => {
    const intermediateState = intermediateReducer(state, action);
    const finalState = crossSliceReducer(intermediateState, action);
    return finalState;
}
