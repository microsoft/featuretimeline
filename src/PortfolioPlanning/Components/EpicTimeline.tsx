import * as React from "react";
import * as moment from "moment";
import { IProject, IEpic, ITimelineGroup, ITimelineItem } from "../Contracts";
import Timeline from "react-calendar-timeline";
import "./EpicTimeline.scss";
import {
    IEpicTimelineState,
    IPortfolioPlanningState
} from "../Redux/Contracts";
import {
    getMessage,
    getEpics,
    getProjects,
    getAddEpicDialogOpen
} from "../Redux/Selectors/EpicTimelineSelectors";
import { EpicTimelineActions } from "../Redux/Actions/EpicTimelineActions";
import { connect } from "react-redux";
import { AddEpicDialog } from "./AddEpicDialog";
// import "react-calendar-timeline/lib/Timeline.css"; // TODO: Use this instead of copying timeline

interface IEpicTimelineOwnProps {}

interface IEpicTimelineMappedProps {
    projects: IProject[];
    epics: IEpic[];
    message: string;
    addEpicDialogOpen: boolean;
}

export type IEpicTimelineProps = IEpicTimelineOwnProps &
    IEpicTimelineMappedProps &
    typeof Actions;

export class EpicTimeline extends React.Component<
    IEpicTimelineProps,
    IEpicTimelineState
> {
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
                <div>{this.props.message}</div>
                <button onClick={this._onButtonClick} />
                <button onClick={this._onAddEpicClick}>Add Epic</button>
                {this._renderAddEpicDialog()}
            </div>
        );
    }

    private _onButtonClick = (): void => {
        this.props.onUpdateMessage(this.props.message + ".");
    };

    private _onAddEpicClick = (): void => {
        this.props.onOpenAddEpicDialog();
    }

    private _renderAddEpicDialog(): JSX.Element {
        if(this.props.addEpicDialogOpen) {
            return <AddEpicDialog onCloseAddEpicDialog={this.props.onCloseAddEpicDialog}/>
        }
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

function mapStateToProps(
    state: IPortfolioPlanningState
): IEpicTimelineMappedProps {
    return {
        projects: getProjects(state.epicTimelineState),
        epics: getEpics(state.epicTimelineState),
        message: getMessage(state.epicTimelineState),
        addEpicDialogOpen: getAddEpicDialogOpen(state.epicTimelineState)
    };
}

const Actions = {
    onUpdateMessage: EpicTimelineActions.updateMessage,
    onOpenAddEpicDialog: EpicTimelineActions.openAddEpicDialog,
    onCloseAddEpicDialog: EpicTimelineActions.closeAddEpicDialog
};

export const ConnectedEpicTimeline = connect(
    mapStateToProps,
    Actions
)(EpicTimeline);
