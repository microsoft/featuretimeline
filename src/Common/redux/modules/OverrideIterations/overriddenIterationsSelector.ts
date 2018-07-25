import { IWorkItemOverrideIterationAwareState } from './overriddenIterationContracts';
import { IEpicRollupState } from '../../../../EpicRollup/redux/contracts';
export const
    OverriddenIterationSelector =
        (state: IEpicRollupState) =>
            state.savedOverriddenIterations;


export function getWorkItemOverrideIteration(state: IWorkItemOverrideIterationAwareState) {
    return state.workItemOverrideIteration;
}            