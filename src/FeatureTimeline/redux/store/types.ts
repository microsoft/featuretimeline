import { Action, combineReducers, Reducer } from 'redux';
import { overrideIterationProgressReducer } from '../../../Common/redux/modules/overrideIterationProgress/overrideIterationProgressReducer';
import { IOverriddenIterationsAwareState, IWorkItemOverrideIterationAwareState } from '../../../Common/redux/modules/OverrideIterations/overriddenIterationContracts';
import backlogConfigurationReducer from './backlogconfiguration/reducer';
import { IBacklogConfigurationState } from './backlogconfiguration/types';
import { ResetType } from './common/actions';
import featureStateReducer from './common/featureStateReducer';
import togglePaneReducer from './common/togglePaneReducer';
import errorReducer from './error/reducer';
import loadingReducer from './loading/reducer';
import teamIterationsReducer from './teamiterations/reducer';
import { ITeamSettingsIterationState } from './teamiterations/types';
import teamSettingReducer from './teamSettings/reducer';
import { ITeamSettingState } from './teamSettings/types';
import workItemReducer from './workitems/reducer';
import { IWorkItemsState } from './workitems/types';
import { IWorkItemMetadataAwareState } from '../../../EpicRoadmap/redux/modules/workItemMetadata/workItemMetadataContracts';
import { workItemMetadataReducer } from '../../../EpicRoadmap/redux/modules/workItemMetadata/workItemMetadataReducer';
import { settingsStateReducer } from '../../../Common/redux/modules/SettingsState/SettingsStateReducer';
import { ISettingsAwareState } from '../../../Common/redux/modules/SettingsState/SettingsStateContracts';
import { savedOverrideIterationsReducer } from '../../../Common/redux/modules/OverrideIterations/overrideWorkItemIterationReducer';
import { showHideDetailsReducer } from '../../../Common/redux/modules/ShowHideDetails/ShowHideDetailsReducer';
import { IShowWorkItemInfoAwareState } from '../../../Common/redux/modules/ShowHideDetails/ShowHideDetailsContracts';

export interface IPlanFeaturesState {
    show: boolean;
    paneWidth: number;
    filter: string;
}

export interface IFeatureTimelineRawState extends
    IOverriddenIterationsAwareState,
    IWorkItemMetadataAwareState,
    ISettingsAwareState,
    IWorkItemOverrideIterationAwareState,
    IShowWorkItemInfoAwareState {
    workItemsState: IWorkItemsState;
    iterationState: ITeamSettingsIterationState;
    error: string;
    backlogConfiguration: IBacklogConfigurationState;
    teamSetting: ITeamSettingState;
    loading: boolean;
   
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
                teamSetting: undefined,
                savedOverriddenIterations: undefined,
                workItemsToShowInfoFor: undefined,
                workItemOverrideIteration: undefined
            } as IFeatureTimelineRawState;
        }
    }

    return state;
}

const intermediateReducer = combineReducers<IFeatureTimelineRawState>({
    workItemsState: workItemReducer,
    workItemMetadata: workItemMetadataReducer,
    iterationState: teamIterationsReducer,
    error: errorReducer,
    backlogConfiguration: backlogConfigurationReducer,
    teamSetting: teamSettingReducer,
    loading: loadingReducer,
    workItemsToShowInfoFor: showHideDetailsReducer,
    workItemOverrideIteration: overrideIterationProgressReducer,
    savedOverriddenIterations: savedOverrideIterationsReducer,
    planFeaturesState: togglePaneReducer,
    featureState: featureStateReducer,
    settingsState: settingsStateReducer
});

// setup reducers
export const reducers: Reducer<IFeatureTimelineRawState> = (state: IFeatureTimelineRawState, action: Action) => {
    const intermediateState = intermediateReducer(state, action);
    const finalState = crossSliceReducer(intermediateState, action);
    return finalState;
}
