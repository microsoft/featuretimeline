import { combineReducers, Reducer, Action } from 'redux';
import { IWorkItemsState } from './workitems/types';
import { IWorkItemMetadataState } from './workitemmetadata/types';
import { ITeamSettingsIterationState } from './teamiterations/types';
import { IBacklogConfigurationState } from './backlogconfiguration/types';

import workItemReducer from './workitems/reducer';
import metadataReducer from './workitemmetadata/reducer';
import teamIterationsReducer from './teamiterations/reducer';
import errorReducer from './error/reducer';
import loadingReducer from './loading/reducer';
import togglePaneReducer from './common/togglePaneReducer';
import featureStateReducer from './common/featureStateReducer';
import backlogConfigurationReducer from './backlogconfiguration/reducer';
import showHideDetailsReducer from "./common/reducer";
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import savedOverriddenWorkItemIterationsReducer from "./workitems/overrideWorkItemIterationReducer";
import overrideIterationReducer from "./overrideIterationProgress/reducer";
import { ResetType } from './common/actions';

export interface IIterationDuration {
    startIteration: TeamSettingsIteration;
    endIteration: TeamSettingsIteration;
    kind: IterationDurationKind;
    overridedBy?: string; // User name for the case when kind is UserOverridden
}

export enum IterationDurationKind {
    None,
    FallBackToCurrentIteration,
    ChildRollup,
    UserOverridden
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
    loading: boolean;
    // This will contain any overridden iterations by the UI in extension storage
    savedOverriddenWorkItemIterations: IDictionaryNumberTo<IOverriddenIterationDuration>;

    // list of work item ids for which the details window is shown 
    workItemDetails: number[];

    workItemOverrideIteration?: IWorkItemOverrideIteration;
    planFeaturesState: IPlanFeaturesState;
    featureState: IDictionaryStringTo<boolean>;
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
    loading: loadingReducer,
    workItemDetails: showHideDetailsReducer,
    workItemOverrideIteration: overrideIterationReducer,
    savedOverriddenWorkItemIterations: savedOverriddenWorkItemIterationsReducer,
    planFeaturesState: togglePaneReducer,
    featureState: featureStateReducer
});

// setup reducers
export const reducers: Reducer<IFeatureTimelineRawState> = (state: IFeatureTimelineRawState, action: Action) => {
    const intermediateState = intermediateReducer(state, action);
    const finalState = crossSliceReducer(intermediateState, action);
    return finalState;
}