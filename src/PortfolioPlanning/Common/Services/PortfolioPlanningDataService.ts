import {
    PortfolioPlanningQueryInput,
    PortfolioPlanningQueryResult,
    PortfolioPlanningQueryResultItem,
    PortfolioPlanningProjectQueryInput,
    PortfolioPlanningProjectQueryResult,
    IQueryResultError,
    Project,
    WorkItem,
    PortfolioPlanningWorkItemQueryResult,
    PortfolioPlanningDirectory,
    PortfolioPlanning,
    ExtensionStorageError,
    PortfolioPlanningTeamsInAreaQueryInput,
    PortfolioPlanningTeamsInAreaQueryResult,
    TeamsInArea,
    PortfolioPlanningFullContentQueryResult,
    PortfolioPlanningMetadata,
    PortfolioPlanningDependencyQueryInput,
    PortfolioPlanningDependencyQueryResult
} from "../../../PortfolioPlanning/Models/PortfolioPlanningQueryModels";
import { ODataClient } from "../ODataClient";
import {
    ODataWorkItemQueryResult,
    ODataAreaQueryResult,
    WellKnownEffortODataColumnNames,
    WorkItemTypeAggregationClauses,
    ODataConstants
} from "../../../PortfolioPlanning/Models/ODataQueryModels";
import { GUIDUtil } from "../Utilities/GUIDUtil";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { defaultProjectComparer } from "../Utilities/Comparers";
import { ExtensionConstants } from "../../Contracts";

export class PortfolioPlanningDataService {
    private static _instance: PortfolioPlanningDataService;
    private static readonly DirectoryDocumentId: string = "Default";
    private static readonly DirectoryCollectionName: string = "Directory";
    private static readonly PortfolioPlansCollectionName: string = "PortfolioPlans";

    public static getInstance(): PortfolioPlanningDataService {
        if (!PortfolioPlanningDataService._instance) {
            PortfolioPlanningDataService._instance = new PortfolioPlanningDataService();
        }
        return PortfolioPlanningDataService._instance;
    }

    public async runPortfolioItemsQuery(
        queryInput: PortfolioPlanningQueryInput
    ): Promise<PortfolioPlanningQueryResult> {
        const workItemsQuery = ODataQueryBuilder.WorkItemsQueryString(queryInput);
        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(undefined, workItemsQuery.queryString);

        return client
            .runPostQuery(fullQueryUrl)
            .then(
                (results: any) =>
                    this.ParseODataPortfolioPlanningQueryResultResponseAsBatch(
                        results,
                        workItemsQuery.aggregationClauses
                    ),
                error => this.ParseODataErrorResponse(error)
            );
    }

    public async runProjectQuery(
        queryInput: PortfolioPlanningProjectQueryInput
    ): Promise<PortfolioPlanningProjectQueryResult> {
        const odataQueryString = ODataQueryBuilder.ProjectsQueryString(queryInput);

        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(undefined, odataQueryString);

        return client
            .runPostQuery(fullQueryUrl)
            .then(
                (results: any) => this.ParseODataProjectQueryResultResponseAsBatch(results),
                error => this.ParseODataErrorResponse(error)
            );
    }

    public async runTeamsInAreasQuery(
        queryInput: PortfolioPlanningTeamsInAreaQueryInput
    ): Promise<PortfolioPlanningTeamsInAreaQueryResult> {
        if (!queryInput || Object.keys(queryInput).length === 0) {
            return Promise.resolve({
                exceptionMessage: null,
                teamsInArea: {}
            });
        }
        const odataQueryString = ODataQueryBuilder.TeamsInAreaQueryString(queryInput);

        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(undefined, odataQueryString);

        return client
            .runPostQuery(fullQueryUrl)
            .then(
                (results: any) => this.ParseODataTeamsInAreaQueryResultResponseAsBatch(results),
                error => this.ParseODataErrorResponse(error)
            );
    }

    public async runDependencyQuery(
        queryInput: PortfolioPlanningDependencyQueryInput
    ): Promise<PortfolioPlanningDependencyQueryResult> {
        const DependsOn: PortfolioPlanningQueryResultItem[] = [];
        const HasDependency: PortfolioPlanningQueryResultItem[] = [];

        for (let i = 1; i < 51; i += 2) {
            DependsOn.push({
                WorkItemId: i,
                WorkItemType: "Epic",
                Title: `${i}`,
                State: "In Progress",
                StartDate: new Date(),
                TargetDate: new Date(),
                ProjectId: `${i}`,
                AreaId: `${i}`,
                TeamId: `${i}`,
                CompletedCount: i,
                TotalCount: 10,
                CompletedEffort: i * 5,
                TotalEffort: 50,
                EffortProgress: 0.1 * i,
                CountProgress: 0.1 * i
            });
            HasDependency.push({
                WorkItemId: i + 1,
                WorkItemType: "Epic",
                Title: `${i + 1}`,
                State: "In Progress",
                StartDate: new Date(),
                TargetDate: new Date(),
                ProjectId: `${i + 1}`,
                AreaId: `${i + 1}`,
                TeamId: `${i + 1}`,
                CompletedCount: i + 1,
                TotalCount: 10,
                CompletedEffort: (i + 1) * 5,
                TotalEffort: 50,
                EffortProgress: 0.1 * (i + 1),
                CountProgress: 0.1 * (i + 1)
            });
        }

        return Promise.resolve({
            DependsOn: DependsOn,
            HasDependency: HasDependency,
            exceptionMessage: null
        });
    }

    public async getODataColumnNameFromWorkItemFieldReferenceName(fieldReferenceName: string): Promise<string> {
        //  For out-of-the-box process templates (Agile, Scrum, etc...), we'll use well-known column names to avoid
        //  a call to the $metadata OData endpoint.
        const columnName = this.GetODataColumnNameFromFieldRefName(fieldReferenceName);

        if (!columnName) {
            const client = await ODataClient.getInstance();
            return client.runMetadataWorkItemReferenceNameQuery(fieldReferenceName);
        }

        return Promise.resolve(columnName);
    }

    public async loadPortfolioContent(
        portfolioQueryInput: PortfolioPlanningQueryInput
    ): Promise<PortfolioPlanningFullContentQueryResult> {
        const projects: { [projectId: string]: boolean } = {};

        portfolioQueryInput.WorkItems.forEach(workItems => {
            const projectIdKey = workItems.projectId.toLowerCase();
            if (!projects[projectIdKey]) {
                projects[projectIdKey] = true;
            }
        });

        const projectsQueryInput: PortfolioPlanningProjectQueryInput = {
            projects
        };

        const [portfolioQueryResult, projectQueryResult] = await Promise.all([
            this.runPortfolioItemsQuery(portfolioQueryInput),
            this.runProjectQuery(projectsQueryInput)
        ]);

        const teamsInAreaQueryInput: PortfolioPlanningTeamsInAreaQueryInput = {};

        for (let entry of (portfolioQueryResult as PortfolioPlanningQueryResult).items) {
            const projectIdKey = entry.ProjectId.toLowerCase();
            const areaIdKey = entry.AreaId.toLowerCase();

            if (!teamsInAreaQueryInput[projectIdKey]) {
                teamsInAreaQueryInput[projectIdKey] = {};
            }

            if (!teamsInAreaQueryInput[projectIdKey][areaIdKey]) {
                teamsInAreaQueryInput[projectIdKey][areaIdKey] = true;
            }
        }

        const teamAreasQueryResult = await this.runTeamsInAreasQuery(teamsInAreaQueryInput);

        return {
            items: portfolioQueryResult,
            projects: projectQueryResult,
            teamAreas: teamAreasQueryResult,
            mergeStrategy: null
        };
    }

    public async getAllProjects(): Promise<PortfolioPlanningProjectQueryResult> {
        const odataQueryString = ODataQueryBuilder.AllProjectsQueryString();

        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(undefined, odataQueryString);

        return client
            .runGetQuery(fullQueryUrl)
            .then(
                (results: any) => this.ParseODataProjectQueryResultResponse(results),
                error => this.ParseODataErrorResponse(error)
            );
    }

    public async getAllWorkItemsOfTypeInProject(
        projectGuid: string,
        workItemType: string
    ): Promise<PortfolioPlanningWorkItemQueryResult> {
        const odataQueryString = ODataQueryBuilder.WorkItemsOfTypeQueryString(workItemType);

        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(projectGuid, odataQueryString);

        return client
            .runGetQuery(fullQueryUrl)
            .then(
                (results: any) => this.ParseODataWorkItemQueryResultResponse(results),
                error => this.ParseODataErrorResponse(error)
            );
    }

    public async GetAllPortfolioPlans(): Promise<PortfolioPlanningDirectory> {
        const client = await this.GetStorageClient();

        return client
            .getDocument(
                PortfolioPlanningDataService.DirectoryCollectionName,
                PortfolioPlanningDataService.DirectoryDocumentId
            )
            .then(
                doc => this.ParsePortfolioDirectory(doc),
                error => {
                    const parsedError = this.ParseStorageError(error);

                    if (parsedError.status === 404) {
                        //  Collection has not been created, initialize it.
                        const newDirectory: PortfolioPlanningDirectory = {
                            exceptionMessage: null,
                            id: PortfolioPlanningDataService.DirectoryDocumentId,
                            entries: []
                        };

                        return client
                            .createDocument(PortfolioPlanningDataService.DirectoryCollectionName, newDirectory)
                            .then(
                                newDirectory => newDirectory,
                                //  We failed while creating the collection for the first time.
                                error => this.ParseStorageError(error)
                            );
                    }

                    return parsedError;
                }
            );
    }

    public async GetPortfolioPlanDirectoryEntry(id: string): Promise<PortfolioPlanningMetadata> {
        const allPlans = await this.GetAllPortfolioPlans();

        return allPlans.entries.find(plan => plan.id === id);
    }

    public async UpdatePortfolioPlanDirectoryEntry(updatedPlan: PortfolioPlanningMetadata): Promise<void> {
        const client = await this.GetStorageClient();

        const allPlans = await this.GetAllPortfolioPlans();
        let indexToUpdate = allPlans.entries.findIndex(plan => plan.id === updatedPlan.id);
        updatedPlan.id = allPlans.entries[indexToUpdate].id;
        allPlans.entries[indexToUpdate] = updatedPlan;

        await client.updateDocument(PortfolioPlanningDataService.DirectoryCollectionName, allPlans);
    }

    public async AddPortfolioPlan(
        newPlanName: string,
        newPlanDescription: string,
        owner: IdentityRef
    ): Promise<PortfolioPlanning> {
        const client = await this.GetStorageClient();
        const newPlanId = GUIDUtil.newGuid().toLowerCase();

        const newPlan: PortfolioPlanning = {
            id: newPlanId,
            name: newPlanName,
            description: newPlanDescription,
            teamNames: [],
            projectNames: [],
            owner: owner,
            createdOn: new Date(),
            projects: {},
            SchemaVersion: ExtensionConstants.CURRENT_PORTFOLIO_SCHEMA_VERSION
        };

        const savedPlan = await client.setDocument(PortfolioPlanningDataService.PortfolioPlansCollectionName, newPlan);
        let allPlans = await this.GetAllPortfolioPlans();

        if (!allPlans) {
            allPlans = {
                exceptionMessage: null,
                id: PortfolioPlanningDataService.DirectoryDocumentId,
                entries: []
            };
        }

        allPlans.entries.push(savedPlan);

        await client.updateDocument(PortfolioPlanningDataService.DirectoryCollectionName, allPlans);

        return newPlan;
    }

    public async GetPortfolioPlanById(portfolioPlanId: string): Promise<PortfolioPlanning> {
        const client = await this.GetStorageClient();
        const planIdLowercase = portfolioPlanId.toLowerCase();

        return client.getDocument(PortfolioPlanningDataService.PortfolioPlansCollectionName, planIdLowercase);
    }

    public async UpdatePortfolioPlan(newPlan: PortfolioPlanning): Promise<PortfolioPlanning> {
        const client = await this.GetStorageClient();

        //  TODO    sanitize other properties (e.g. unique set of work item ids, all strings lower case)
        newPlan.id = newPlan.id.toLowerCase();

        return client
            .updateDocument(PortfolioPlanningDataService.PortfolioPlansCollectionName, newPlan)
            .then(doc => doc);
    }

    public async DeletePortfolioPlan(planId: string): Promise<void> {
        const client = await this.GetStorageClient();
        const planIdToDelete = planId.toLowerCase();

        let allPlans = await this.GetAllPortfolioPlans();
        allPlans.entries = allPlans.entries.filter(plan => plan.id !== planIdToDelete);

        await client.updateDocument(PortfolioPlanningDataService.DirectoryCollectionName, allPlans);

        return client.deleteDocument(PortfolioPlanningDataService.PortfolioPlansCollectionName, planIdToDelete);
    }

    public async DeleteAllData(): Promise<number> {
        const client = await this.GetStorageClient();
        let totalThatWillBeDeleted = 0;

        //  Delete documents in Directory collection.
        const allEntriesInDirectory = await client.getDocuments(PortfolioPlanningDataService.DirectoryCollectionName);
        totalThatWillBeDeleted += allEntriesInDirectory.length;

        allEntriesInDirectory.forEach(doc => {
            client
                .deleteDocument(PortfolioPlanningDataService.DirectoryCollectionName, doc.id)
                .then(deletedDoc => console.log(`Deleted Directory collection document: ${doc.id}`));
        });

        //  Delete documents in Portfolio plans collection.
        const allEntriesInPlans = await client.getDocuments(PortfolioPlanningDataService.PortfolioPlansCollectionName);
        totalThatWillBeDeleted += allEntriesInPlans.length;

        allEntriesInPlans.forEach(doc => {
            client
                .deleteDocument(PortfolioPlanningDataService.PortfolioPlansCollectionName, doc.id)
                .then(deletedDoc => console.log(`Deleted Plans collection document: ${doc.id}`));
        });

        return totalThatWillBeDeleted;
    }

    private GetODataColumnNameFromFieldRefName(fieldReferenceName: string): WellKnownEffortODataColumnNames {
        if (!fieldReferenceName) {
            return null;
        }

        return PortfolioPlanningDataService.WellKnownODataColumnNamesByWorkItemRefName[
            fieldReferenceName.toLowerCase()
        ];
    }

    private static readonly WellKnownODataColumnNamesByWorkItemRefName: {
        [fieldReferenceName: string]: WellKnownEffortODataColumnNames;
    } = {
        "microsoft.vsts.scheduling.effort": WellKnownEffortODataColumnNames.Effort,
        "microsoft.vsts.scheduling.storypoints": WellKnownEffortODataColumnNames.StoryPoints,
        "microsoft.vsts.scheduling.size": WellKnownEffortODataColumnNames.Size
    };

    private async GetStorageClient(): Promise<IExtensionDataService> {
        return VSS.getService<IExtensionDataService>(VSS.ServiceIds.ExtensionData);
    }

    private ParsePortfolioDirectory(doc: any): PortfolioPlanningDirectory {
        if (!doc) {
            return {
                exceptionMessage: null,
                id: null,
                entries: null
            };
        }

        const directory: PortfolioPlanningDirectory = doc;

        for (const entry of directory.entries) {
            entry.createdOn = new Date(entry.createdOn);
        }

        return directory;
    }

    private ParseStorageError(error: any): IQueryResultError {
        if (!error) {
            return {
                exceptionMessage: "no error information"
            };
        }

        const parsedError: ExtensionStorageError = error;

        return {
            exceptionMessage: parsedError.message,
            status: parsedError.status
        };
    }

    private ParseODataBatchResponse(
        results: any
    ): {
        exceptionMessage: any;
        responseValue: any;
    } {
        if (!results) {
            return null;
        }

        const responseString: string = results;

        try {
            //  TODO hack hack ... Look for start of JSON response "{"@odata.context""
            const start = responseString.indexOf('{"@odata.context"');
            const end = responseString.lastIndexOf("}");

            if (start !== -1) {
                const jsonString = responseString.substring(start, end + 1);
                const jsonObject = JSON.parse(jsonString);

                if (!jsonObject || !jsonObject["value"]) {
                    return null;
                }

                return {
                    exceptionMessage: null,
                    responseValue: jsonObject
                };
            } else {
                //  TODO hack hack ... Didn't find OData success response, let's see if there was an OData error.
                const start = responseString.indexOf('{"error"');
                const end = responseString.lastIndexOf("}");
                const jsonString = responseString.substring(start, end + 1);
                const jsonObject = JSON.parse(jsonString);

                return {
                    exceptionMessage: jsonObject.error.message,
                    responseValue: null
                };
            }
        } catch (error) {
            console.log(error);

            return {
                exceptionMessage: error,
                responseValue: null
            };
        }
    }

    private ParseODataPortfolioPlanningQueryResultResponseAsBatch(
        results: any,
        aggregationClauses: WorkItemTypeAggregationClauses
    ): PortfolioPlanningQueryResult {
        try {
            const rawResponseValue = this.ParseODataBatchResponse(results);

            if (
                !rawResponseValue ||
                (rawResponseValue.exceptionMessage && rawResponseValue.exceptionMessage.length > 0)
            ) {
                const errorMessage =
                    rawResponseValue!.exceptionMessage || "No response payload found in OData batch query";

                return {
                    exceptionMessage: errorMessage,
                    items: []
                };
            }

            return {
                exceptionMessage: null,
                items: this.PortfolioPlanningQueryResultItems(rawResponseValue.responseValue, aggregationClauses)
            };
        } catch (error) {
            console.log(error);

            return {
                exceptionMessage: error,
                items: []
            };
        }
    }

    private PortfolioPlanningQueryResultItems(
        jsonValuePayload: any,
        aggregationClauses: WorkItemTypeAggregationClauses
    ): PortfolioPlanningQueryResultItem[] {
        if (!jsonValuePayload || !jsonValuePayload["value"]) {
            return null;
        }

        return jsonValuePayload.value.map(jsonArrayItem => {
            const rawItem: ODataWorkItemQueryResult = jsonArrayItem;
            const areaIdValue: string = rawItem.AreaSK ? rawItem.AreaSK.toLowerCase() : null;

            const result: PortfolioPlanningQueryResultItem = {
                WorkItemId: rawItem.WorkItemId,
                WorkItemType: rawItem.WorkItemType,
                Title: rawItem.Title,
                State: rawItem.State,
                StartDate: rawItem.StartDate ? new Date(rawItem.StartDate) : null,
                TargetDate: rawItem.TargetDate ? new Date(rawItem.TargetDate) : null,
                ProjectId: rawItem.ProjectSK,
                AreaId: areaIdValue,
                TeamId: null, //  Will be assigned when teams in areas data is retrieved.
                CompletedCount: 0,
                TotalCount: 0,
                CompletedEffort: 0,
                TotalEffort: 0,
                EffortProgress: 0.0,
                CountProgress: 0.0
            };

            const descendantsJsonObject = jsonArrayItem[ODataConstants.Descendants];
            if (descendantsJsonObject && descendantsJsonObject.length === 1) {
                const projectIdLowercase = rawItem.ProjectSK.toLowerCase();
                const propertyAliases = aggregationClauses.aliasMap[projectIdLowercase]
                    ? aggregationClauses.aliasMap[projectIdLowercase]
                    : null;

                this.ParseDescendant(descendantsJsonObject[0], result, propertyAliases);
            }

            return result;
        });
    }

    private ParseODataTeamsInAreaQueryResultResponseAsBatch(results: any): PortfolioPlanningTeamsInAreaQueryResult {
        try {
            const rawResponseValue = this.ParseODataBatchResponse(results);

            if (
                !rawResponseValue ||
                (rawResponseValue.exceptionMessage && rawResponseValue.exceptionMessage.length > 0)
            ) {
                const errorMessage =
                    rawResponseValue!.exceptionMessage || "No response payload found in OData batch query";

                return {
                    exceptionMessage: errorMessage,
                    teamsInArea: null
                };
            }

            return this.ParseODataTeamsInAreaQueryResultResponse(rawResponseValue.responseValue);
        } catch (error) {
            console.log(error);

            return {
                exceptionMessage: error,
                teamsInArea: null
            };
        }
    }

    private ParseODataTeamsInAreaQueryResultResponse(results: any): PortfolioPlanningTeamsInAreaQueryResult {
        if (!results || !results["value"]) {
            return null;
        }

        const rawResult: ODataAreaQueryResult[] = results.value;

        return {
            exceptionMessage: null,
            teamsInArea: this.PortfolioPlanningAreaQueryResultItems(rawResult)
        };
    }

    private ParseODataWorkItemQueryResultResponse(results: any): PortfolioPlanningWorkItemQueryResult {
        if (!results || !results["value"]) {
            return null;
        }

        const rawResult: WorkItem[] = results.value;

        return {
            exceptionMessage: null,
            workItems: rawResult
        };
    }

    private ParseODataProjectQueryResultResponseAsBatch(results: any): PortfolioPlanningProjectQueryResult {
        try {
            const rawResponseValue = this.ParseODataBatchResponse(results);

            if (
                !rawResponseValue ||
                (rawResponseValue.exceptionMessage && rawResponseValue.exceptionMessage.length > 0)
            ) {
                const errorMessage =
                    rawResponseValue!.exceptionMessage || "No response payload found in OData batch query";

                return {
                    exceptionMessage: errorMessage,
                    projects: []
                };
            }

            return this.ParseODataProjectQueryResultResponse(rawResponseValue.responseValue);
        } catch (error) {
            console.log(error);

            return {
                exceptionMessage: error,
                projects: null
            };
        }
    }

    private ParseODataProjectQueryResultResponse(results: any): PortfolioPlanningProjectQueryResult {
        if (!results || !results["value"]) {
            return null;
        }

        const rawResult: Project[] = results.value;

        //  Sort results by project name.
        rawResult.sort(defaultProjectComparer);

        return {
            exceptionMessage: null,
            projects: rawResult
        };
    }

    private ParseDescendant(
        descendantJsonObject: any,
        resultItem: PortfolioPlanningQueryResultItem,
        propertyAliases: {
            totalEffortAlias: string;
            completedEffortAlias: string;
        }
    ): void {
        //  Parse static content. All queries, no matter the work item types project configuration
        //  will always return these values for each descendant.
        const totalCount: number = descendantJsonObject[ODataConstants.TotalCount] || 0;
        const completedCount: number = descendantJsonObject[ODataConstants.CompletedCount] || 0;
        const countProgress: number = totalCount && completedCount && totalCount > 0 ? completedCount / totalCount : 0;

        resultItem.TotalCount = totalCount;
        resultItem.CompletedCount = completedCount;
        resultItem.CountProgress = countProgress;

        //  Effort progress values depend on the work item type used for the requirement backlog level.
        let totalEffort: number = 0;
        let completedEffort: number = 0;
        let effortProgress: number = 0;

        if (propertyAliases) {
            totalEffort = descendantJsonObject[propertyAliases.totalEffortAlias] || 0;
            completedEffort = descendantJsonObject[propertyAliases.completedEffortAlias] || 0;
            effortProgress = totalEffort && completedEffort && totalEffort > 0 ? completedEffort / totalEffort : 0;
        }

        resultItem.TotalEffort = totalEffort;
        resultItem.CompletedEffort = completedEffort;
        resultItem.EffortProgress = effortProgress;
    }

    private PortfolioPlanningAreaQueryResultItems(rawItems: ODataAreaQueryResult[]): TeamsInArea {
        const result: TeamsInArea = {};

        rawItems.forEach(areaQueryResult => {
            const areaIdKey = areaQueryResult.AreaSK.toLowerCase();
            result[areaIdKey] = areaQueryResult.Teams.map(odataTeam => {
                return {
                    teamId: odataTeam.TeamSK.toLowerCase(),
                    teamName: odataTeam.TeamName
                };
            });
        });

        return result;
    }

    private ParseODataErrorResponse(results: any): IQueryResultError {
        let errorMessage: string = "Unknown Error";

        if (results && results.responseJSON && results.responseJSON.error && results.responseJSON.error.message) {
            errorMessage = results.responseJSON.error.message;
        } else if (results) {
            errorMessage = JSON.stringify(results, null, "    ");
        }

        return {
            exceptionMessage: errorMessage
        };
    }
}

export class ODataQueryBuilder {
    private static readonly ProjectEntitySelect: string = "ProjectSK,ProjectName";

    public static WorkItemsQueryString(
        input: PortfolioPlanningQueryInput
    ): {
        queryString: string;
        aggregationClauses: WorkItemTypeAggregationClauses;
    } {
        const descendantsQuery = this.BuildODataDescendantsQuery(input);

        // prettier-ignore
        return {
            queryString: 
            "WorkItems" +
            "?" +
                "$select=WorkItemId,WorkItemType,Title,State,StartDate,TargetDate,ProjectSK,AreaSK" +
            "&" +
                `$filter=${this.BuildODataQueryFilter(input)}` +
            "&" +
                `$expand=${descendantsQuery.queryString}`,
            aggregationClauses: descendantsQuery.aggregationClauses
        };
    }

    public static ProjectsQueryString(input: PortfolioPlanningProjectQueryInput): string {
        // prettier-ignore
        return (
            "Projects" +
            "?" +
                `$select=${ODataQueryBuilder.ProjectEntitySelect}` +
            "&" +
                `$filter=${this.ProjectsQueryFilter(input)}`
        );
    }

    public static AllProjectsQueryString(): string {
        // prettier-ignore
        return (
            "Projects" +
            "?" +
                `$select=${ODataQueryBuilder.ProjectEntitySelect}`
        );
    }

    public static WorkItemsOfTypeQueryString(workItemType: string): string {
        // prettier-ignore
        return (
            "WorkItems" +
            "?" +
                "$select=WorkItemId,WorkItemType,Title,State" +
            "&" +
                `$filter=WorkItemType eq '${workItemType}'`
        );
    }

    public static TeamsInAreaQueryString(input: PortfolioPlanningTeamsInAreaQueryInput): string {
        // prettier-ignore
        return (
            "Areas" +
            "?" +
                "$select=ProjectSK,AreaSK" +
            "&" +
                `$filter=${this.ProjectAreasFilter(input)}` +
            "&" +
                "$expand=Teams($select=TeamSK,TeamName)"
        );
    }

    /**
     *  (
                ProjectSK eq FBED1309-56DB-44DB-9006-24AD73EEE785
            and (
                    AreaSK eq aaf9cd34-350e-45da-8600-a39bbfe14cb8
                or  AreaSK eq 549aa146-cad9-48ba-86da-09f0bdee4a03
            )
        ) or (
                ProjectId eq 6974D8FE-08C8-4123-AD1D-FB830A098DFB
            and (
                    AreaSK eq fa64fee6-434f-4405-94e3-10c1694d5d26
            )
        )
     */
    private static ProjectAreasFilter(input: PortfolioPlanningTeamsInAreaQueryInput): string {
        return Object.keys(input)
            .map(
                projectId =>
                    `(ProjectSK eq ${projectId} and (${Object.keys(input[projectId])
                        .map(areaId => `AreaSK eq ${areaId}`)
                        .join(" or ")}))`
            )
            .join(" or ");
    }

    /**
     *  (
                ProjectId eq FBED1309-56DB-44DB-9006-24AD73EEE785
        ) or (
                ProjectId eq 6974D8FE-08C8-4123-AD1D-FB830A098DFB
        )
     * @param input 
     */
    private static ProjectsQueryFilter(input: PortfolioPlanningProjectQueryInput): string {
        return Object.keys(input.projects)
            .map(pid => `(ProjectId eq ${pid})`)
            .join(" or ");
    }

    /**
     *  (
                Project/ProjectId eq FBED1309-56DB-44DB-9006-24AD73EEE785
            and (
                    WorkItemId eq 5250
                or  WorkItemId eq 5251
                )
        ) or (
                Project/ProjectId eq 6974D8FE-08C8-4123-AD1D-FB830A098DFB
            and (
                    WorkItemId eq 5249
            )
        )
     * @param input 
     */
    private static BuildODataQueryFilter(input: PortfolioPlanningQueryInput): string {
        const projectFilters = input.WorkItems.map(wi => {
            const wiIdClauses = wi.workItemIds.map(id => `WorkItemId eq ${id}`);

            const parts: string[] = [];
            parts.push(`Project/ProjectId eq ${wi.projectId}`);
            parts.push(`(${wiIdClauses.join(" or ")})`);

            return `(${parts.join(" and ")})`;
        });

        return projectFilters.join(" or ");
    }

    /**
     *  (
                Project/ProjectId eq FBED1309-56DB-44DB-9006-24AD73EEE785
            and WorkItemType eq 'Epic'
        ) or (
                Project/ProjectId eq 6974D8FE-08C8-4123-AD1D-FB830A098DFB
            and WorkItemType eq 'Epic'
        )
     * @param input 
     */
    private static BuildODataDescendantsQueryFilter(input: PortfolioPlanningQueryInput): string {
        const projectFilters = input.WorkItems.map(wi => {
            const parts: string[] = [];
            parts.push(`Project/ProjectId eq ${wi.projectId}`);
            parts.push(`WorkItemType eq '${wi.DescendantsWorkItemTypeFilter}'`);

            return `(${parts.join(" and ")})`;
        });

        return projectFilters.join(" or ");
    }

    /**
     * Descendants(
        $apply=
            filter(WorkItemType eq 'User Story' or WorkItemType eq 'Task')
            /aggregate(
                $count as TotalCount,
                iif(StateCategory eq 'Completed',1,0) with sum as CompletedCount,
                StoryPoints with sum as TotalStoryPoints,
                iif(StateCategory eq 'Completed',StoryPoints,0) with sum as CompletedStoryPoints
            )
            /compute(
                (CompletedCount div cast(TotalCount, Edm.Decimal)) as CountProgress,
                (CompletedStoryPoints div TotalStoryPoints) as StoryPointsProgress
            )
        )
     * @param input 
     */
    private static BuildODataDescendantsQuery(
        input: PortfolioPlanningQueryInput
    ): {
        queryString: string;
        aggregationClauses: WorkItemTypeAggregationClauses;
    } {
        const aggregationClauses = this.BuildEffortSelectionConditional(input);
        const descendantsWorkItemTypeFilters = this.BuildODataDescendantsQueryFilter(input);
        const allAggregationClauses = Object.keys(aggregationClauses.allClauses);

        // prettier-ignore
        return {
            queryString: 
                "Descendants(" +
                    "$apply=" +
                        `filter(${descendantsWorkItemTypeFilters})` +
                        "/aggregate(" +
                            "$count as TotalCount," +
                            "iif(StateCategory eq 'Completed',1,0) with sum as CompletedCount," +
                            `${allAggregationClauses.join(", ")}` +
                        ")" +
                ")",
            aggregationClauses: aggregationClauses
        };
    }

    private static BuildEffortSelectionConditional(input: PortfolioPlanningQueryInput): WorkItemTypeAggregationClauses {
        const result: WorkItemTypeAggregationClauses = {
            aliasMap: {},
            allClauses: {},
            allDescendantsWorkItemTypes: {}
        };

        if (!input) {
            return result;
        }

        let temporaryIdCounter: number = 0;
        const colTypeMap: {
            [oDataColumnName: string]: { [descendantWorkItemType: string]: number /**alias seed */ };
        } = {};

        input.WorkItems.forEach(project => {
            const descendantWorkItemTypeLowercase = project.DescendantsWorkItemTypeFilter.toLowerCase();
            const oDataColumnName = project.EffortODataColumnName;
            const projectIdKeyLowercase = project.projectId.toLowerCase();

            if (!colTypeMap[oDataColumnName]) {
                colTypeMap[oDataColumnName] = {};
            }

            if (!colTypeMap[oDataColumnName][descendantWorkItemTypeLowercase]) {
                temporaryIdCounter++;
                colTypeMap[oDataColumnName][descendantWorkItemTypeLowercase] = temporaryIdCounter;
            }

            const aliasSeed: number = colTypeMap[oDataColumnName][descendantWorkItemTypeLowercase];
            const totalAlias = `Total${aliasSeed}`.toLowerCase();
            const totalClause =
                `iif(WorkItemType eq '${descendantWorkItemTypeLowercase}', ${oDataColumnName},  0) ` +
                `with sum as ${totalAlias}`.toLowerCase();

            const completedAlias = `Completed${aliasSeed}`.toLowerCase();
            const completedClause =
                "iif(" +
                "    StateCategory eq 'Completed' " +
                `and WorkItemType eq '${descendantWorkItemTypeLowercase}', ${oDataColumnName},  0) ` +
                `with sum as ${completedAlias}`.toLowerCase();

            //  Save column alias used by project to read results.
            if (!result.aliasMap[projectIdKeyLowercase]) {
                result.aliasMap[projectIdKeyLowercase] = {
                    totalEffortAlias: totalAlias,
                    completedEffortAlias: completedAlias
                };
            }

            //  Add clauses set.
            result.allClauses[totalClause] = "";
            result.allClauses[completedClause] = "";

            //  Keep a set of descendants work item types.
            if (!result.allDescendantsWorkItemTypes[descendantWorkItemTypeLowercase]) {
                result.allDescendantsWorkItemTypes[
                    descendantWorkItemTypeLowercase
                ] = `WorkItemType eq '${descendantWorkItemTypeLowercase}'`;
            }
        });

        return result;
    }
}
