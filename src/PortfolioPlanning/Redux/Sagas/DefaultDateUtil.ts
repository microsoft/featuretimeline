import { PortfolioPlanningFullContentQueryResult } from "../../Models/PortfolioPlanningQueryModels";
import { JsonPatchDocument } from "VSS/WebApi/Contracts";
import { IEpic } from "../../Contracts";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";
import * as VSS_Service from "VSS/Service";
import { effects, SagaIterator } from "redux-saga";
import { getEpicById } from "../Selectors/EpicTimelineSelectors";

export function* SetDefaultDatesForEpics(queryResult: PortfolioPlanningFullContentQueryResult) {
    let epicsWithoutDates: number[] = [];
    let now, oneMonthFromNow;

    queryResult.items.items.map(item => {
        if (!item.StartDate || !item.TargetDate) {
            now = new Date();
            now.setHours(0, 0, 0, 0);
            oneMonthFromNow = new Date();
            oneMonthFromNow.setHours(0, 0, 0, 0);
            oneMonthFromNow.setDate(now.getDate() + 30);
            epicsWithoutDates.push(item.WorkItemId);
            item.StartDate = now;
            item.TargetDate = oneMonthFromNow;
        }
    });

    // TODO: Add error handling.
    yield effects.all(epicsWithoutDates.map(epic => effects.call(saveDatesToServer, epic, now, oneMonthFromNow)));
}

/*
This method is called from two places:
1. setting dates for a selected epic from UI
2. set default dates for newly added epic.
In second case, epic is not saved into state yet.
*/
export function* saveDatesToServer(epicId: number, defaultStartDate?: Date, defaultEndDate?: Date): SagaIterator {
    const epic: IEpic = yield effects.select(getEpicById, epicId);
    let startDate: Date = defaultStartDate;
    let endDate: Date = defaultEndDate;

    if (epic && epic.startDate && epic.endDate) {
        startDate = epic.startDate;
        endDate = epic.endDate;
    }

    const doc: JsonPatchDocument = [
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.Scheduling.StartDate",
            value: startDate
        },
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.Scheduling.TargetDate",
            value: endDate
        }
    ];

    const witHttpClient: WorkItemTrackingHttpClient = yield effects.call(
        [VSS_Service, VSS_Service.getClient],
        WorkItemTrackingHttpClient
    );

    yield effects.call([witHttpClient, witHttpClient.updateWorkItem], doc, epicId);

    // TODO: Error experience
}
