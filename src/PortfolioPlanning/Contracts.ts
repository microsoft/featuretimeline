import moment = require("moment");

export interface IProject {
    id: string;
    title: string;
}

export interface IEpic {
    id: number;
    project: string;
    title: string;
    startDate?: Date;
    endDate?: Date;
}

export interface ITimelineGroup {
    id: string;
    title: string;
}

export interface ITimelineItem {
    id: number;
    group: string;
    title: string;
    start_time: moment.Moment;
    end_time: moment.Moment;
}
