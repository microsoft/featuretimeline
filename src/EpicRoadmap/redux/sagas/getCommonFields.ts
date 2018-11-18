import { BacklogConfiguration } from 'azure-devops-extension-api/Work';
export function getCommonFields(backlogConfiguration: BacklogConfiguration) {
    const stackRankFieldRefName = backlogConfiguration.backlogFields.typeFields["Order"];
    const effortsFieldRefName = backlogConfiguration.backlogFields.typeFields["Effort"];
    const teamFieldRefName = backlogConfiguration.backlogFields.typeFields["Team"] || "System.AreaPath";
    const fields = ["System.Id",
        "System.Title",
        "System.AssignedTo",
        "System.State",
        "System.IterationId",
        "System.IterationPath",
        "System.WorkItemType",
        stackRankFieldRefName,
        effortsFieldRefName,
        teamFieldRefName];
    return fields;
}