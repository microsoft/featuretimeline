import "./IterationRenderer.scss";
import * as React from "react";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { isCurrentIteration } from "../../redux/helpers/iterationComparer";

export interface IIterationRendererProps {
    iteration: TeamSettingsIteration;

}

function getMMDD(date: Date) {
    var mm = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1); // getMonth() is zero-based
   var dd  = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
   return `${mm}/${dd}`;
}

export class IterationRenderer extends React.Component<IIterationRendererProps, {}> {
    public render(): JSX.Element {
        const {
            iteration
        } = this.props;

        // TODO: Start and end date conversion?
        const startDate = iteration.attributes["startDate"] ? getMMDD(new Date(iteration.attributes["startDate"])) : null;
        const endDate = iteration.attributes["finishDate"] ? getMMDD(new Date(iteration.attributes["finishDate"])) : null;

        let dates: JSX.Element = null;
        if (startDate && endDate) {
            dates = (
                <div className="dates">
                    {`${startDate} - ${endDate}`}
                </div>
            );
        }

        let currentMarker = null;
        if (isCurrentIteration(iteration)) {
            currentMarker = (
                <span className="current-sprint-marker">Current</span>
            );
        }

        return (
            <div className="iteration">
                <div className="iterationname">
                    <span>{iteration.name}</span>
                    {currentMarker}
                </div>
                {dates}
            </div>
        );
    }
}