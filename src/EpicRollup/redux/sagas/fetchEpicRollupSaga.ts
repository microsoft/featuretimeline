import { fetchBacklogConfiguration } from "./fetchBacklogConfigurationSaga";
import { select } from "redux-saga/effects";
import { backlogConfigurationForProjectSelector } from "../backlogconfiguration/backlogconfigurationselector";
import { BacklogConfiguration } from "TFS/Work/Contracts";

export function* fetchEpicRollup(epicIds: number[]) {
    // get backlog configuration for the project
    yield fetchBacklogConfiguration();
    const backlogconfiguration: BacklogConfiguration = yield select(backlogConfigurationForProjectSelector);

    const portfolioBacklogs = backlogconfiguration.portfolioBacklogs;
    const requiermentBacklog = backlogconfiguration.requirementBacklog;

    const featureTypes = portfolioBacklogs[0].workItemTypes;
    const storyTypes = requiermentBacklog.workItemTypes;
    const stackRankFieldRefName = backlogconfiguration.backlogFields.typeFields["Order"];

    // get all children including granch children
    const wiql = `SELECT [System.Id], 
                    [System.Title], 
                    [System.AssignedTo], 
                    [${stackRankFieldRefName}],
                    [System.State], 
                    [System.WorkItemType] 
                FROM WorkItemLinks 
                WHERE (Source.[System.Id] IN(${ epicIds.join(",")}) )
                    AND [System.Links.LinkType] IN ('System.LinkTypes.Hierarchy-Forward')
                    AND Target.[System.WorkItemType] <> ''
                ORDER BY [${stackRankFieldRefName}], [Microsoft.VSTS.Common.Priority], [System.Id] mode(Recursive)`;


    // check if there are any dependencies that are cross epic, if any filter them out and show message
    // check if there are any depedencies that are cross project, if any filter them out and show message

    // build epic hierarchy
    // build dependency tree

    // fetch all the iterations for the project
    // sort the iterations
    // mark iteration with duplicate start/end dates
    // find overlapping iterations and group them in a pseudo iteration section

    // Fetch overridden iteration start/end dates

    // find the earliest iteration as per the work items above
    // find the latest iteration as per the work items above
    // filter out all iterations expect -1 and +1 of above range
}