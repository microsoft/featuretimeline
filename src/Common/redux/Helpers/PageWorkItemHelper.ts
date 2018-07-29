import { WorkItem } from "TFS/WorkItemTracking/Contracts";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";
import * as VSS_Service from 'VSS/Service';

export class PageWorkItemHelper {

    /**
     * Pages work items with given id
     * Considers the length of the constructed url and does paging based in the lenght of the url + max page size
     */
    public static pageWorkItems(ids: number[], projectName?: string, fields?: string[]): IPromise<WorkItem[]> {
        const pwh = PageWorkItemHelper;
        fields = fields.filter(f => !!f);
        ids = ids.filter(i => !!i);

        // Calculate length of the field query parameter
        const fieldLength = fields ? `&fields=${fields.join("%2C")}`.length : 0;
        const urlPrefixLength = 400; // This is a worst case approximation which include account name and route
        const maxUrlLength = 2000;
        const allowedLength = maxUrlLength - urlPrefixLength - fieldLength;

        const maxPageSize = 200;
        const promises: IPromise<WorkItem[]>[] = [];

        let pageIds: number[] = [];
        let currentLength = 0;
        for (const id of ids) {
            const idLength = `${id}%2C`.length;

            // If we have exceeded url length or page size, page the work items
            if ((currentLength + idLength) >= allowedLength || pageIds.length >= maxPageSize) {
                promises.push(pwh._pageWorkItems(pageIds, projectName, fields));
                pageIds = [id];
                currentLength = idLength;
            } else {
                pageIds.push(id);
                currentLength += idLength;
            }
        }

        // Page remaining work items
        if (pageIds.length > 0) {
            promises.push(pwh._pageWorkItems(pageIds, projectName, fields));
        }

        return Promise.all(promises)
            .then(results => {
                const workItems: WorkItem[] = [];
                for (const result of results) {
                    workItems.push(...result);
                }
                return workItems;
            });

    }

    private static _pageWorkItems(ids: number[], projectName?: string, fieldRefNames?: string[]): IPromise<WorkItem[]> {
        const witHttpClient = PageWorkItemHelper._getHttpClient();
        return witHttpClient.getWorkItems(ids,
            fieldRefNames,
            null, // asof
            null, // expand
            null, // error policy
            projectName
        );
    }

    private static _getHttpClient(): WorkItemTrackingHttpClient {
        
        return VSS_Service.getClient(WorkItemTrackingHttpClient);;
    }

}