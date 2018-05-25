import { createStore, applyMiddleware, Store, compose } from 'redux';
import { reducers, IFeatureTimelineRawState } from './store/types';
import createSagaMiddleware from 'redux-saga'
import { trackActions } from './sagas/trackActions';
import { watchSagaActions } from './sagas';

export default function configureStore(
    initialState: IFeatureTimelineRawState
): Store<IFeatureTimelineRawState> {

    const sagaMiddleWare = createSagaMiddleware();
    const middleware = applyMiddleware(sagaMiddleWare, trackActions);

    // Setup for using the redux dev tools in chrome 
    // https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
    const composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;
    
    const store = createStore<IFeatureTimelineRawState>(
        reducers,
        initialState, 
        composeEnhancers(middleware));

    sagaMiddleWare.run(watchSagaActions);
    return store;
}

