import * as React from "react";
import "./PlanCard.scss";
import { Card } from "azure-devops-ui/Card";
import { IdentityView } from "../../Common/Components/IdentityView";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { Tooltip } from "azure-devops-ui/TooltipEx";

export interface IPlanCardProps {
    planId: string;
    name: string;
    description: string;
    projects: string[];
    teams: string[];
    owner: IdentityRef;
    onClick: (id: string) => void;
}

export const PlanCard = (props: IPlanCardProps) => {
    if (!props.planId) {
        console.log("here again");
    }

    return (
        <div className="plan-card-container" onClick={() => props.onClick(props.planId)}>
            <Card className="plan-card">
                <div className="plan-card-details">
                    <div className="flex-column summary">
                        <div className="name">{props.name}</div>
                        <div className="description">{props.description}</div>
                        {props.projects &&
                            props.projects.length > 0 && (
                                <div className="projects-container">
                                    <div className="projects-label">Projects</div>
                                    <Tooltip overflowOnly={true}>
                                        <div className="projects-list">{props.projects.join(", ")}</div>
                                    </Tooltip>
                                </div>
                            )}
                        {props.teams &&
                            props.teams.length > 0 && (
                                <div className="teams-container">
                                    <div className="teams-label">Teams</div>
                                    <Tooltip overflowOnly={true}>
                                        <div className="teams-list">{props.teams.join(", ")}</div>
                                    </Tooltip>
                                </div>
                            )}
                    </div>
                    <IdentityView className="owner-container" value={props.owner} />
                </div>
            </Card>
        </div>
    );
};
