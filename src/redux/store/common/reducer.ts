import { Reducer } from 'redux';
import { CommonActions, ShowDetailsType, CloseDetailsType } from './actions';
const reducer: Reducer<number[]> = (state: number[] = [], action: CommonActions) => {
    switch (action.type) {
        case ShowDetailsType:
            return [...state, action.payload.id];
        case CloseDetailsType:
            return state.filter(id => id !== action.payload.id);
        default:
            return state;
    }
};

export default reducer;