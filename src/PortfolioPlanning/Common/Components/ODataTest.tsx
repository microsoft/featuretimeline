import * as React from "react";
import * as PortfolioModels from "../../Models/PortfolioPlanningQueryModels";
import { PortfolioPlanningDataService } from "../Services/PortfolioPlanningDataService";

export interface ODataTestState {
    results: PortfolioModels.PortfolioPlanningQueryResult;
    allProjects: string;
    workItemsOfTypeInProject: string;
    input: string;
}

export class ODataTest extends React.Component<{}, ODataTestState> {
    constructor(props) {
        super(props);

        const initialTestData: PortfolioModels.PortfolioPlanningQueryInput = {
            WorkItems: [
                {
                    projectId: "FBED1309-56DB-44DB-9006-24AD73EEE785",
                    WorkItemTypeFilter: "Epic",
                    DescendantsWorkItemTypeFilter: "User Story",
                    EffortODataColumnName: "StoryPoints",
                    EffortWorkItemFieldRefName: "Microsoft.VSTS.Scheduling.StoryPoints",
                    workItemIds: [5250, 5251]
                },
                {
                    projectId: "6974D8FE-08C8-4123-AD1D-FB830A098DFB",
                    WorkItemTypeFilter: "Epic",
                    DescendantsWorkItemTypeFilter: "User Story",
                    EffortODataColumnName: "StoryPoints",
                    EffortWorkItemFieldRefName: "Microsoft.VSTS.Scheduling.StoryPoints",
                    workItemIds: [5249]
                }
            ]
        };

        this.state = {
            results: null,
            input: JSON.stringify(initialTestData, null, "    "),
            workItemsOfTypeInProject: null,
            allProjects: null
        };

        this.HandleSubmit = this.HandleSubmit.bind(this);
        this.HandleInputChange = this.HandleInputChange.bind(this);
        this.HandleTestExtensionStorage = this.HandleTestExtensionStorage.bind(this);

        //  Run initial query.
        this.HandleSubmit(null);
    }

    public render() {
        const inputStyle = {
            width: "100%",
            height: "150px"
        };
        const input = (
            <div>
                <form onSubmit={this.HandleSubmit}>
                    <label>
                        OData Query Input (json):
                        <textarea style={inputStyle} value={this.state.input} onChange={this.HandleInputChange} />
                    </label>
                    <label>
                        All projects
                        <textarea style={inputStyle} value={this.state.allProjects} />
                    </label>
                    <label>
                        Work Items of Type in Project
                        <textarea style={inputStyle} value={this.state.workItemsOfTypeInProject} />
                    </label>

                    <input type="submit" value="Submit" />
                </form>
                <input type="button" value="Test extension storage" onClick={this.HandleTestExtensionStorage} />
            </div>
        );

        if (!this.state || !this.state.results) {
            return input;
        }

        return (
            <div>
                {input}
                <textarea style={inputStyle} value={JSON.stringify(this.state.results, null, "    ")} />
            </div>
        );
    }

    public HandleSubmit(event) {
        this.RunQuery(this.state.input).then(
            results => this.setState({ results }),
            error => this.setState({ results: error })
        );

        this.GetAllProjects().then(
            allProjects => {
                const stringValue = JSON.stringify(allProjects, null, "    ");
                this.setState({ allProjects: stringValue });
            },
            error => this.setState({ results: error })
        );

        this.GetWorkItemsOfTypeInProject().then(
            workItems => {
                const stringValue = JSON.stringify(workItems, null, "    ");
                this.setState({ workItemsOfTypeInProject: stringValue });
            },
            error => this.setState({ results: error })
        );
    }

    public HandleTestExtensionStorage(event) {
        PortfolioPlanningDataService.getInstance()
            .GetAllPortfolioPlans()
            .then(allPlans => {
                console.log("INITIAL STATE:");
                console.log(JSON.stringify(allPlans, null, "    "));

                PortfolioPlanningDataService.getInstance()
                    .AddPortfolioPlan("new plan name", "new plan description", undefined)
                    .then(newPlanCreated => {
                        console.log("Plan created");
                        console.log(JSON.stringify(newPlanCreated, null, "    "));

                        PortfolioPlanningDataService.getInstance()
                            .GetAllPortfolioPlans()
                            .then(allPlans => {
                                console.log("Second state:");
                                console.log(JSON.stringify(allPlans, null, "    "));

                                PortfolioPlanningDataService.getInstance()
                                    .GetPortfolioPlanById(newPlanCreated.id)
                                    .then(planRetrieved => {
                                        console.log("retrieved plan");
                                        console.log(JSON.stringify(planRetrieved, null, "    "));

                                        //  Update plan to include information for two projects.
                                        planRetrieved.projects["FBED1309-56DB-44DB-9006-24AD73EEE785"] = {
                                            ProjectId: "FBED1309-56DB-44DB-9006-24AD73EEE785",
                                            PortfolioWorkItemType: "Epic",
                                            RequirementWorkItemType: "User Story",
                                            EffortODataColumnName: "StoryPoints",
                                            EffortWorkItemFieldRefName: "Microsoft.VSTS.Scheduling.StoryPoints",
                                            WorkItemIds: [5250, 5251]
                                        };

                                        planRetrieved.projects["6974D8FE-08C8-4123-AD1D-FB830A098DFB"] = {
                                            ProjectId: "6974D8FE-08C8-4123-AD1D-FB830A098DFB",
                                            PortfolioWorkItemType: "Epic",
                                            RequirementWorkItemType: "User Story",
                                            EffortODataColumnName: "StoryPoints",
                                            EffortWorkItemFieldRefName: "Microsoft.VSTS.Scheduling.StoryPoints",
                                            WorkItemIds: [5249]
                                        };
                                    });
                            });
                    });
            });
    }

    public HandleInputChange(event) {
        this.setState({
            input: event.target.value
        });
    }

    public RunQuery(inputString: string): IPromise<PortfolioModels.PortfolioPlanningQueryResult> {
        const input: PortfolioModels.PortfolioPlanningQueryInput = JSON.parse(inputString);
        return PortfolioPlanningDataService.getInstance().runPortfolioItemsQuery(input);
    }

    public GetAllProjects(): IPromise<PortfolioModels.PortfolioPlanningProjectQueryResult> {
        return PortfolioPlanningDataService.getInstance().getAllProjects();
    }

    public GetWorkItemsOfTypeInProject(): IPromise<PortfolioModels.PortfolioPlanningWorkItemQueryResult> {
        return PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
            "fbed1309-56db-44db-9006-24ad73eee785",
            "Epic"
        );
    }
}
