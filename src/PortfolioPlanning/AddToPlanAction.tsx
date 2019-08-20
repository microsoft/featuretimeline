import { PortfolioPlanningDataService } from "./Common/Services/PortfolioPlanningDataService";

export function getActionProvider() {
    return {
        getMenuItems: context => {
            const dataService = PortfolioPlanningDataService.getInstance();
            const workItemIds = getWorkItemIds(context);

            return dataService.GetAllPortfolioPlans().then(plans => {
                const childItems: IContributedMenuItem[] = [];
                const result: IContributedMenuItem[] = [];

                plans.entries.forEach(metadata => {
                    childItems.push({
                        title: metadata.name,
                        action: () => addToPlan(metadata.id, workItemIds)
                    });
                });

                result.push({
                    title: "Add to Portfolio Plan",
                    childItems: childItems
                });

                return result;
            });
        }
    };
}

export function getWorkItemIds(context: any): number[] {
    if (!context || !context.workItemIds) {
        return [];
    }

    const workItemIds: number[] = context.workItemIds;
    return workItemIds;
}

export function addToPlan(planId: string, workItemIds: number[]): void {
    console.log(`Adding ${workItemIds.join(",")} to plan ${planId}`);
}
