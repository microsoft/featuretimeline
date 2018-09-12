import "./IterationRenderer.scss";
import * as React from "react";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { isCurrentIteration } from "../../redux/Helpers/iterationComparer";

export interface IIterationRendererProps {
    iteration: TeamSettingsIteration;
    teamIterations: TeamSettingsIteration[];
}

function getMMDD(date: Date) {
    var mm = date.getUTCMonth() < 9 ? "0" + (date.getUTCMonth() + 1) : (date.getUTCMonth() + 1); // getMonth() is zero-based
    var dd = date.getUTCDate() < 10 ? "0" + date.getUTCDate() : date.getUTCDate();
    return `${mm}/${dd}`;
}

export class IterationRenderer extends React.Component<IIterationRendererProps, {}> {
    public render(): JSX.Element {
        const {
            iteration,
            teamIterations,
        } = this.props;

        const startDate = iteration.attributes && iteration.attributes["startDate"] ? getMMDD(new Date(iteration.attributes["startDate"])) : null;
        const endDate = iteration.attributes && iteration.attributes["finishDate"] ? getMMDD(new Date(iteration.attributes["finishDate"])) : null;

        let dates: JSX.Element = null;
        if (startDate && endDate) {
            dates = (
                <div className="dates">
                    {`${startDate} - ${endDate}`}
                </div>
            );
        }

        const isBacklogIteration = !teamIterations.some(ti => ti.id === iteration.id);

        let marker = null;
        if (isBacklogIteration) {
            marker = (
                <span className="unplanned-sprint-marker">Backlog</span>
            );
        } else if (isCurrentIteration(teamIterations, iteration)) {
            marker = (
                <span className="current-sprint-marker">Current</span>
            );
        }
        const name = iteration && iteration.name || "";

        return (
            <div className="iteration">
                <div className="iterationname">
                    <span>{name}</span>
                    {marker}
                </div>
                {dates}
            </div>
        );
    }
}