import { TeamIterationsMap } from './teamIterationsContracts';
import produce from "immer";
import { TeamIterationsActions, TeamIterationsReceivedType } from './teamIterationsActions';
import { compareIteration } from '../../../../Common/redux/Helpers/iterationComparer';

export function teamIterationsReducer(state: TeamIterationsMap, action: TeamIterationsActions): TeamIterationsMap {
    if(!state) {
        state = {};
    }
    return produce(state, draft => {
        const {
            payload
        } = action;
        switch (action.type) {
            case TeamIterationsReceivedType:
                {
                    const {
                        teamId,
                        teamIterations
                    } = payload;
                    draft[teamId] = teamIterations.sort(compareIteration);
                }
        }
    });
}