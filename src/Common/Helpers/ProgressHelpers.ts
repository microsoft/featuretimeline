import { IWorkItemDisplayDetails } from "../Contracts/GridViewContracts";
import { ProgressTrackingCriteria } from "../Contracts/OptionsInterfaces";
export function getProgress(children: IWorkItemDisplayDetails[], criteria: ProgressTrackingCriteria) {
    const completedChildren = children.filter(c => c.isComplete);
    switch (criteria) {
        case ProgressTrackingCriteria.ChildWorkItems: {
            return {
                total: children.length,
                completed: completedChildren.length
            };
        }
        case ProgressTrackingCriteria.EffortsField: {
            return {
                total: getEfforts(children),
                completed: getEfforts(completedChildren)
            };
        }
    }
    return {
        total: 0,
        completed: 0
    };
}
function getEfforts(workItems: IWorkItemDisplayDetails[]): number {
    return workItems.reduce((prev, w) => prev + w.efforts, 0);
}