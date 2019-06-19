import * as React from "react";
import * as moment from "moment";
import { IProject, IEpic, ITimelineGroup, ITimelineItem } from "../Contracts";
import Timeline from "react-calendar-timeline";
import "./EpicTimeline.scss";
import {
    IPortfolioPlanningState,
    getMessage
} from "../Redux/PortfolioPlanningStore";
import { connect } from "react-redux";
// import "react-calendar-timeline/lib/Timeline.css"; // TODO: Use this instead of copying timeline

interface IEpicTimelineProps {
    projects: IProject[];
    epics: IEpic[];
    message: string;
}

export class EpicTimeline extends React.Component<IEpicTimelineProps> {
    constructor() {
        super();
    }

    public render(): JSX.Element {
        const timelineGroups: ITimelineGroup[] = this.props.projects.map(
            this._mapProjectToTimelineGroups
        );
        const timelineItems: ITimelineItem[] = this.props.epics.map(
            this._mapEpicToTimelineItem
        );

        return (
            <div>
                <Timeline
                    groups={timelineGroups}
                    items={timelineItems}
                    defaultTimeStart={moment().add(-6, "month")}
                    defaultTimeEnd={moment().add(6, "month")}
                    stackItems={true}
                />
            </div>
        );
    }

    private _mapProjectToTimelineGroups(project: IProject): ITimelineGroup {
        return {
            id: project.id,
            title: project.title
        };
    }

    private _mapEpicToTimelineItem(epic: IEpic): ITimelineItem {
        return {
            id: epic.id,
            group: epic.project,
            title: epic.title,
            start_time: moment(epic.startDate),
            end_time: moment(epic.endDate)
        };
    }
}

function mapStateToProps(state: IPortfolioPlanningState): IEpicTimelineProps {
    return {
        projects: state.projects,
        epics: state.epics,
        message: getMessage(state)
    };
}

const Actions = {};

export const ConnectedEpicTimeline = connect(
    mapStateToProps,
    Actions
)(EpicTimeline);
