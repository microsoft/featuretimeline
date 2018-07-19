import { Reducer } from 'redux';
import { CommonActions, ShowDetailsType, CloseDetailsType } from './actions';
import produce from "immer";

const reducer: Reducer<number[]> = (state: number[] = [], action: CommonActions) => {
    return produce(state, draft => {
        switch (action.type) {
            case ShowDetailsType:
                draft.push(action.payload.id);;
                break;
            case CloseDetailsType:
                return draft.filter(id => id !== action.payload.id);
                break;
        }
    });
};

export default reducer;