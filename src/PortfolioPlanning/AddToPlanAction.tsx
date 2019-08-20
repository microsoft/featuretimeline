import { PortfolioPlanningDataService } from "./Common/Services/PortfolioPlanningDataService";
import { IDialogInputData } from "./SelectPlanDialog";
import { PortfolioPlanningDirectory } from "./Models/PortfolioPlanningQueryModels";

export class PortfolioPlanActionsService {
    private static _instance: PortfolioPlanActionsService;
    private _externalDialog: IExternalDialog;

    private constructor() {
        console.log("New PortfolioPlanActionsService!");
    }

    public static getInstance(): PortfolioPlanActionsService {
        if (!PortfolioPlanActionsService._instance) {
            PortfolioPlanActionsService._instance = new PortfolioPlanActionsService();
        }
        return PortfolioPlanActionsService._instance;
    }

    public getAddToPlanActionProvider() {
        return {
            getMenuItems: context => {
                console.log(context);
                const dataService = PortfolioPlanningDataService.getInstance();
                const workItemIds = this.getWorkItemIds(context);

                return dataService.GetAllPortfolioPlans().then(plans => {
                    const childItems: IContributedMenuItem[] = [];
                    const result: IContributedMenuItem[] = [];

                    plans.entries.forEach(metadata => {
                        childItems.push({
                            title: metadata.name,
                            action: () => this.addToPlan(metadata.id, workItemIds)
                        });
                    });

                    childItems.push({
                        title: "Other plan...",
                        action: () => this.openAllPlansDialog(workItemIds, plans)
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

    private openAllPlansDialog(workItemIds: number[], directory: PortfolioPlanningDirectory): void {
        let onOkClickHandler: () => Promise<void> = null;

        const dialogInput: IDialogInputData = {
            workItemIds,
            directory,
            setOnOkClickHandler: (onOkClickHandlerInstance: () => Promise<void>) => {
                onOkClickHandler = onOkClickHandlerInstance;
            }
        };

        VSS.getService(VSS.ServiceIds.Dialog).then((hostDialogService: IHostDialogService) => {
            const extensionContext = VSS.getExtensionContext();
            hostDialogService
                .openDialog(
                    `${extensionContext.publisherId}.${
                        extensionContext.extensionId
                    }.workitem-portfolio-planning-show-all-plans-action`,
                    {
                        title: "Select Portfolio Plan",
                        width: 500,
                        height: 400,
                        modal: true,
                        buttons: {
                            add: {
                                id: "Add",
                                text: "Add",
                                click: () => {
                                    if (this._externalDialog && onOkClickHandler) {
                                        this._externalDialog.updateOkButton(false);

                                        return onOkClickHandler().then(
                                            () => {
                                                this._externalDialog.close();
                                            },
                                            (error: Error | string) => {
                                                if (typeof error === "string") {
                                                    this._externalDialog.setTitle(error);
                                                } else {
                                                    this._externalDialog.setTitle(error.message);
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    },
                    dialogInput
                )
                .then(externalDialog => (this._externalDialog = externalDialog));
        });
    }

    private getWorkItemIds(context: any): number[] {
        let result: number[] = [];

        if (!context) {
            return result;
        }

        if (context.workItemIds) {
            result = context.workItemIds;
            return result;
        }

        if (context.workItemId) {
            result.push(context.workItemId);
            return result;
        }

        if (context.ids) {
            result = context.ids;
            return result;
        }

        if (context.id) {
            result.push(context.id);
            return result;
        }

        return result;
    }

    private addToPlan(planId: string, workItemIds: number[]): Promise<void> {
        console.log(`Adding ${workItemIds.join(",")} to plan ${planId}`);
        return Promise.resolve();
    }
}
