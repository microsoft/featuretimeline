import { Action, combineReducers, Reducer } from 'redux';
import { overrideIterationProgressReducer } from '../../../Common/modules/overrideIterationProgress/reducer';
import { IOverriddenIterationsAwareState, IWorkItemOverrideIteration } from '../../../Common/modules/OverrideIterations/overriddenIterationContracts';
import savedOverrideIterationsReducer from '../../../Common/modules/OverrideIterations/overrideWorkItemIterationReducer';
import backlogConfigurationReducer from './backlogconfiguration/reducer';
import { IBacklogConfigurationState } from './backlogconfiguration/types';
import { ResetType } from './common/actions';
import featureStateReducer from './common/featureStateReducer';
import showHideDetailsReducer from "./common/reducer";
import togglePaneReducer from './common/togglePaneReducer';
import errorReducer from './error/reducer';
import loadingReducer from './loading/reducer';
import teamIterationsReducer from './teamiterations/reducer';
import { ITeamSettingsIterationState } from './teamiterations/types';
import teamSettingReducer from './teamSettings/reducer';
import { ITeamSettingState } from './teamSettings/types';
import workItemReducer from './workitems/reducer';
import { IWorkItemsState } from './workitems/types';
import { IWorkItemMetadataAwareState } from '../../../EpicRollup/redux/modules/workItemMetadata/workItemMetadataContracts';
import { workItemMetadataReducer } from '../../../EpicRollup/redux/modules/workItemMetadata/workItemMetadataReducer';
import { settingsStateReducer } from '../../../Common/modules/SettingsState/SettingsStateReducer';
import { ISettingsAwareState } from '../../../Common/modules/SettingsState/SettingsStateContracts';


export interface IPlanFeaturesState {
    show: boolean;
    paneWidth: number;
    filter: string;
}

export interface IFeatureTimelineRawState extends
    IOverriddenIterationsAwareState, IWorkItemMetadataAwareState, ISettingsAwareState {
    workItemsState: IWorkItemsState;
    iterationState: ITeamSettingsIterationState;
    error: string;
    backlogConfiguration: IBacklogConfigurationState;
    teamSetting: ITeamSettingState;
    loading: boolean;

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
                teamSetting: undefined,
                savedOverriddenIterations: undefined,
                workItemDetails: undefined,
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
    workItemDetails: showHideDetailsReducer,
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
