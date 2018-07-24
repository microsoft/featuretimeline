import { createStore, applyMiddleware, Store, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga'
import { IEpicRollupState } from './contracts';
import { backlogConfigurationReducer } from './modules/backlogconfiguration/backlogconfiguratonreducer';
import { teamIterationsReducer } from './modules/teamIterations/teamIterationReducer';
import savedOverrideIterationsReducer from '../../Common/modules/OverrideIterations/overrideWorkItemIterationReducer';
import { workItemsReducer } from './modules/workItems/workItemReducer';
import { fetchEpicRollup } from './sagas/fetchEpicRollupSaga';
import { workItemMetadataReducer } from './modules/workItemMetadata/workItemMetadataReducer';

export default function configureEpicRollupStore(
    initialState: IEpicRollupState
): Store<IEpicRollupState> {

    const sagaMonitor = window["__SAGA_MONITOR_EXTENSION__"] || undefined;
    const sagaMiddleWare = createSagaMiddleware(sagaMonitor);
    const middleware = applyMiddleware(sagaMiddleWare);

    // Setup for using the redux dev tools in chrome 
    // https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
    const composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;

    const reducers = combineReducers({
        backlogConfigurations: backlogConfigurationReducer,
        teamIterations: teamIterationsReducer,
        savedOverriddenIterations: savedOverrideIterationsReducer,
        workItemsState: workItemsReducer,
        workItemMetadata: workItemMetadataReducer
    });


    const store = createStore(
        reducers,
        initialState,
        composeEnhancers(middleware));

    //TODO: User MRU or select
    sagaMiddleWare.run(fetchEpicRollup, 10);

    return store;
}

