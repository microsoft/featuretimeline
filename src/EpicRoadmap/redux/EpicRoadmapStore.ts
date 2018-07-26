import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { iterationDisplayOptionsReducer } from '../../Common/redux/modules/IterationDisplayOptions/iterationDisplayOptionsReducer';
import { overrideIterationProgressReducer } from '../../Common/redux/modules/overrideIterationProgress/overrideIterationProgressReducer';
import { savedOverrideIterationsReducer } from '../../Common/redux/modules/OverrideIterations/overrideWorkItemIterationReducer';
import { progressAwareReducer } from '../../Common/redux/modules/ProgressAwareState/ProgressAwareStateReducer';
import { settingsStateReducer } from '../../Common/redux/modules/SettingsState/SettingsStateReducer';
import { IEpicRoadmapState } from './contracts';
import { backlogConfigurationReducer } from './modules/backlogconfiguration/backlogconfiguratonreducer';
import { teamIterationsReducer } from './modules/teamIterations/teamIterationReducer';
import { teamSettingsReducer } from './modules/teamsettings/teamsettingsreducer';
import { workItemMetadataReducer } from './modules/workItemMetadata/workItemMetadataReducer';
import { workItemsReducer } from './modules/workItems/workItemReducer';
import { fetchEpicRoadmap } from './sagas/fetchEpicRoadmapSaga';
import { showHideDetailsReducer } from '../../Common/redux/modules/ShowHideDetails/ShowHideDetailsReducer';
import { watchEpicRoadmapSagaActions } from './sagas/watchEpicRoadmapSagaActions';
import { highlightDependencyReducer } from '../../Common/redux/modules/HighlightDependencies/HighlightDependenciesModule';

export default function configureEpicRoadmapStore(
    initialState: IEpicRoadmapState
): Store<IEpicRoadmapState> {

    const sagaMonitor = window["__SAGA_MONITOR_EXTENSION__"] || undefined;
    const sagaMiddleWare = createSagaMiddleware({sagaMonitor});
    const middleware = applyMiddleware(sagaMiddleWare);

    // Setup for using the redux dev tools in chrome 
    // https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
    const composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;

    const reducers = combineReducers({
        backlogConfigurations: backlogConfigurationReducer,
        teamIterations: teamIterationsReducer,
        savedOverriddenIterations: savedOverrideIterationsReducer,
        workItemsState: workItemsReducer,
        workItemMetadata: workItemMetadataReducer,
        teamSettings: teamSettingsReducer,
        settingsState: settingsStateReducer,
        iterationDisplayOptions: iterationDisplayOptionsReducer,
        progress: progressAwareReducer,
        workItemOverrideIteration: overrideIterationProgressReducer,
        workItemsToShowInfoFor: showHideDetailsReducer,
        highlightedDependency: highlightDependencyReducer        
    });


    const store = createStore(
        reducers,
        initialState,
        composeEnhancers(middleware));

    sagaMiddleWare.run(watchEpicRoadmapSagaActions);

    //TODO: User MRU or select
    sagaMiddleWare.run(fetchEpicRoadmap, 10);


    return store;
}

