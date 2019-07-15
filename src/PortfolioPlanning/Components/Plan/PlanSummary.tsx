import * as React from "react";
import "./PlanSummary.scss";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { IdentityView } from "../../Common/Components/IdentityView";
import { Tooltip } from "azure-devops-ui/TooltipEx";

export interface IPlanSummaryProps {
    owner: IdentityRef;
    projectNames: string[];
    teamNames: string[];
}

export const PlanSummary = (props: IPlanSummaryProps) => {
    const projectNameList = props.projectNames.join(", ");
    const teamNameList = props.teamNames.join(", ");

    return (
        <div className="page-content page-content-top plan-summary">
            <IdentityView className="owner" value={props.owner} />
            {projectNameList && (
                <div className="summary-item">
                    <div className="projects-teams-label">Projects</div>
                    <Tooltip overflowOnly={true}>
                        <div className="projects-teams-content">{projectNameList}</div>
                    </Tooltip>
                </div>
            )}
            {teamNameList && (
                <div className="summary-item">
                    <div className="projects-teams-label">Teams</div>
                    <Tooltip overflowOnly={true}>
                        <div className="projects-teams-content">{teamNameList}</div>
                    </Tooltip>
                </div>
            )}
        </div>
    );
};
