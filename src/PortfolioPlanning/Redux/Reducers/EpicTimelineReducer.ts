import { IEpicTimelineState } from "../Contracts";
import { Projects, Epics, OtherEpics } from "../SampleData";
import {
    EpicTimelineActions,
    EpicTimelineActionTypes
} from "../Actions/EpicTimelineActions";
import produce from "immer";

export function epicTimelineReducer(
    state: IEpicTimelineState,
    action: EpicTimelineActions
): IEpicTimelineState {
    return produce(state || getDefaultState(), (draft: IEpicTimelineState) => {
        switch (action.type) {
            case EpicTimelineActionTypes.UpdateMessage: {
                draft.message = action.payload.message;

                break;
            }
            case EpicTimelineActionTypes.OpenAddEpicDialog: {
                draft.addEpicDialogOpen = true;
                break;
            }
            case EpicTimelineActionTypes.CloseAddEpicDialog: {
                draft.addEpicDialogOpen = false;
                break;
            }
        }
    });
}

export function getDefaultState(): IEpicTimelineState {
    return {
        projects: Projects,
        epics: Epics,
        otherEpics: OtherEpics,
        message: "Initial message",
        addEpicDialogOpen: false
    };
}
