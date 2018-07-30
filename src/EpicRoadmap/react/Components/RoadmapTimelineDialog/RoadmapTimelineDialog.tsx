import * as React from "react";
import { EpicRoadmapGridViewSelector } from '../../../redux/selectors/EpicRoadmapGridViewSelector';
import { EpicRoadmapGridContent, IEpicRoadmapGridContentProps } from '../EpicRoadmapGrid';
import './RoadmapTimelineDialog.scss';
import { TimelineDialog } from '../../../../Common/react/Components/TimelineDialog/TimelineDialog';

export interface IRoadmapTimelineDialogProps extends IEpicRoadmapGridContentProps {
    clearOverrideIteration: (id: number) => void;
}

export class RoadmapTimelineDialog extends React.Component<IRoadmapTimelineDialogProps, {}> {
    public render() {
        const workItem = this._getGridWorkItem();
        return (
            <TimelineDialog
                id={this._getId()}
                title={workItem.workItem.title}
                iterationDuration={workItem.workItem.iterationDuration}
                teamIterations={this.props.gridView.teamIterations}
                backlogIteration={this.props.gridView.backlogIteration}
                closeDetails={this.props.closeDetails}
                clearOverrideIteration={this.props.clearOverrideIteration}
                saveOverrideIteration={this.props.saveOverrideIteration}

            >
                {this._getChildrenFeatureTimelineGrid()}
            </TimelineDialog>
        );
    }

    private _getGridWorkItem() {
        return this.props.gridView.workItems.filter(w => w.workItem.id === this._getId())[0];
    }
    private _getChildrenFeatureTimelineGrid() {
        const gridView = EpicRoadmapGridViewSelector(/*isSubGrid*/ true, this.props.rawState.workItemsToShowInfoFor[0])(this.props.rawState);
        if (gridView.workItems.length === 0) {
            return null;
        }
        return (
            <EpicRoadmapGridContent {...this.props} gridView={gridView} isSubGrid={true} />
        );
    }

    private _getId = () => {
        return this.props.rawState.workItemsToShowInfoFor[0];
    }
}

