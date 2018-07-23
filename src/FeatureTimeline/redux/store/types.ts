import { Action, combineReducers, Reducer } from 'redux';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { overrideIterationProgressReducer } from '../../../Common/modules/overrideIterationProgress/reducer';
import { IOverriddenIterationsAwareState, IWorkItemOverrideIteration } from '../../../Common/modules/OverrideIterations/overriddenIterationContracts';
import savedOverrideIterationsReducer from '../../../Common/modules/OverrideIterations/overrideWorkItemIterationReducer';
import backlogConfigurationReducer from './backlogconfiguration/reducer';
import { IBacklogConfigurationState } from './backlogconfiguration/types';
import { ResetType } from './common/actions';
import featureStateReducer from './common/featureStateReducer';
import showHideDetailsReducer from "./common/reducer";
import settingsReducer from "./common/settingsReducer";
import togglePaneReducer from './common/togglePaneReducer';
import errorReducer from './error/reducer';
import loadingReducer from './loading/reducer';
import teamIterationsReducer from './teamiterations/reducer';
import { ITeamSettingsIterationState } from './teamiterations/types';
import teamSettingReducer from './teamSettings/reducer';
import { ITeamSettingState } from './teamSettings/types';
import metadataReducer from './workitemmetadata/reducer';
import { IWorkItemMetadataState } from './workitemmetadata/types';
import workItemReducer from './workitems/reducer';
import { IWorkItemsState } from './workitems/types';
import { ISettingsState } from '../../../Common/Contracts/OptionsInterfaces';


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

export interface IPlanFeaturesState {
    show: boolean;
    paneWidth: number;
    filter: string;
}

export interface IFeatureTimelineRawState extends
    IOverriddenIterationsAwareState {
    workItemsState: IWorkItemsState;
    workItemMetadata: IWorkItemMetadataState;
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
    workItemMetadata: metadataReducer,
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
    settingsState: settingsReducer
});

// setup reducers
export const reducers: Reducer<IFeatureTimelineRawState> = (state: IFeatureTimelineRawState, action: Action) => {
    const intermediateState = intermediateReducer(state, action);
    const finalState = crossSliceReducer(intermediateState, action);
    return finalState;
}
