import produce from "immer";
import { ShowDetailsType, CloseDetailsType, ShowHideDetailsActions } from "./ShowHideDetailsActions";

export function showHideDetailsReducer(state: number[] = [], action: ShowHideDetailsActions): number[] {
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
