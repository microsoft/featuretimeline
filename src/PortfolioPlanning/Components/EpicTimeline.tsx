import * as React from "react";
import * as moment from "moment";
import { IProject, IEpic, ITimelineGroup, ITimelineItem } from "../Contracts";
import { Timeline } from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";

interface IEpicTimelineProps {
    projects: IProject[];
    epics: IEpic[];
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
                {/* <ul>
                    {timelineGroups.map(group => <li>{group.id}</li>)}
                    {timelineItems.map(item => <li>{item.id}</li>)}
                </ul> */}
                <Timeline
                    groups={timelineGroups}
                    items={timelineItems}
                    defaultTimeStart={moment().add(-6, "month")}
                    defaultTImeEnd={moment().add(6, "month")}
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
