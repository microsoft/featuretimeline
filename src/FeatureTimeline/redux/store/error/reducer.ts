import { Reducer } from 'redux';
import { ErrorActions, GenericErrorType } from './actions';

const reducer: Reducer<string> = (state: string = "", action: ErrorActions) => {
    switch (action.type) {
        case GenericErrorType:
            if (typeof action.payload === "string") {
                return action.payload;
            }
            return action.payload["message"];
        default:
            return state;
    }
};

export default reducer;