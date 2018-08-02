import { IWorkItemOverrideIterationAwareState } from './overriddenIterationContracts';
import { IEpicRoadmapState } from '../../../../EpicRoadmap/redux/contracts';
export const
    OverriddenIterationSelector =
        (state: IEpicRoadmapState) =>
            state.savedOverriddenIterations || {};


export function getWorkItemOverrideIteration(state: IWorkItemOverrideIterationAwareState) {
    return state.workItemOverrideIteration;
}            