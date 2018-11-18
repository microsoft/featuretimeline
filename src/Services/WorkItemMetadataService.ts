import { WorkItemType, WorkItemStateColor, WorkItemTrackingRestClient } from "azure-devops-extension-api/WorkItemTracking";
import { getClient } from "azure-devops-extension-api";

export class WorkItemMetadataService {
    private static _instance: WorkItemMetadataService;
    public static getInstance(): WorkItemMetadataService {
        if (!WorkItemMetadataService._instance) {

            WorkItemMetadataService._instance = new WorkItemMetadataService();
        }
        return WorkItemMetadataService._instance;
    }

    private _workItemTypes: WorkItemType[] = null;

    public async getWorkItemTypes(projectId): Promise<WorkItemType[]> {
        if (this._workItemTypes) {
            return this._workItemTypes;
        }

        const witHttpClient = getClient(WorkItemTrackingRestClient);
        this._workItemTypes = await witHttpClient.getWorkItemTypes(projectId);

        return this._workItemTypes;
    }

    private _states: { [key: string]: WorkItemStateColor[]} = null;

    public async getStates(projectId, workItemTypeNames: string[]): Promise<{ [key: string]: WorkItemStateColor[]}> {
        if (this._states) {
            return this._states;
        }

        const map = {};
        const promises = [];
        const witHttpClient = getClient(WorkItemTrackingRestClient);
        if (witHttpClient.getWorkItemTypeStates) {
            for (const wit of workItemTypeNames) {
                promises.push(this.getStatusForWit(projectId, wit, map));
            }
        }
        await Promise.all(promises);
        this._states = map;
        return map;
    }

    private async getStatusForWit(projectId, wit, map) {
        const witHttpClient = getClient(WorkItemTrackingRestClient);
        return witHttpClient.getWorkItemTypeStates(projectId, wit)
            .then((states) => {
                map[wit] = states;
            });
    }
}
