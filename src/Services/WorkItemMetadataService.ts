import { WorkItemType, WorkItemStateColor } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "VSS/Service";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";

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

        const witHttpClient = getClient(WorkItemTrackingHttpClient);
        this._workItemTypes = await witHttpClient.getWorkItemTypes(projectId);

        return this._workItemTypes;
    }

    private _states: IDictionaryStringTo<WorkItemStateColor[]> = null;

    public async getStates(projectId, workItemTypeNames: string[]): Promise<IDictionaryStringTo<WorkItemStateColor[]>> {
        if (this._states) {
            return this._states;
        }

        const map = {};
        const promises = [];
        const witHttpClient = getClient(WorkItemTrackingHttpClient);
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
        const witHttpClient = getClient(WorkItemTrackingHttpClient);
        return witHttpClient.getWorkItemTypeStates(projectId, wit)
            .then((states) => {
                map[wit] = states;
            });
    }
}
