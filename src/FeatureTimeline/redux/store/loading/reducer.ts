import { Reducer } from 'redux';
import { LoadingActions, LoadingType } from './actions';
const reducer: Reducer<boolean> = (state: boolean = false, action: LoadingActions) => {
    switch (action.type) {
        case LoadingType:
            return action.payload;
        default:
            return state;
    }
};

export default reducer;