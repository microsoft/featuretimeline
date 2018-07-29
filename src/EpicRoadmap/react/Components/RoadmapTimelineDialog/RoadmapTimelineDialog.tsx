import { Button, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import * as React from 'react';
import { IterationRenderer } from '../../../../Common/react/Components/IterationRenderer';
import { IterationDurationKind } from '../../../../Common/redux/Contracts/IIterationDuration';
import { EpicRoadmapGridViewSelector } from '../../../redux/selectors/EpicRoadmapGridViewSelector';
import { EpicRoadmapGridContent, IEpicRoadmapGridContentProps } from '../EpicRoadmapGrid';
import './RoadmapTimelineDialog.scss';

export interface IRoadmapTimelineDialogProps extends IEpicRoadmapGridContentProps {
    clearOverrideIteration: (id: number) => void;
}

export class RoadmapTimelineDialog extends React.Component<IRoadmapTimelineDialogProps, {}> {
    public render() {
        const gridWorkItem = this._getGridWorkItem();
        let dialogDetails = null;
        let footer = null;
        switch (gridWorkItem.workItem.iterationDuration.kind) {
            case IterationDurationKind.UserOverridden:
                dialogDetails = this._getCustomIterationDurationDetails();
                break;
            default:
                dialogDetails = this._getChildrenFeatureTimelineGrid();
                footer = (
                    <DialogFooter>
                        <div>
                            <PrimaryButton onClick={() => this.props.closeDetails(this._getId())}>Close</PrimaryButton>
                        </div>
                    </DialogFooter>
                )
        }

        return (
            <Dialog
                hidden={false}
                onDismiss={() => this.props.closeDetails(this._getId())}
                dialogContentProps={
                    {
                        type: DialogType.close,
                        title: gridWorkItem.workItem.title
                    }
                }
                modalProps={
                    {
                        isBlocking: true,
                        containerClassName: "timeline-dialog"
                    }
                }
            >
                {dialogDetails}
                {footer}
            </Dialog>
        );
    }

    private _getChildrenFeatureTimelineGrid() {
        const gridView = EpicRoadmapGridViewSelector(/*isSubGrid*/ true, this.props.rawState.workItemsToShowInfoFor[0])(this.props.rawState);
        return (
            <EpicRoadmapGridContent {...this.props} gridView={gridView} isSubGrid={true} />
        );
    }

    private _getGridWorkItem() {
        return this.props.gridView.workItems.filter(w => w.workItem.id === this._getId())[0];
    }

    private _getCustomIterationDurationDetails() {
        const gridWorkItem = this._getGridWorkItem();
        const {
            overridedBy,
            startIteration,
            endIteration
        } = gridWorkItem.workItem.iterationDuration;

        const title = `${overridedBy} has set following start and end iteration for this workitem.`;

        return (
            <div className="dialog-contents">
                <div className="dialog-grid-container">
                    {this._getChildrenFeatureTimelineGrid()}
                </div>

                <div className="custom-duration-container">
                    <div className="custom-duration-title">
                        {title}
                    </div>
                    <div className="custom-duration-iterations">
                        <div className="custom-duration-iteration text">
                            {"Start Iteration"}
                        </div>
                        <div className="custom-duration-iteration text">
                            {"End Iteration"}
                        </div>
                    </div>
                    <div className="custom-duration-iterations">
                        <div className="custom-duration-iteration">
                            <IterationRenderer teamIterations={this.props.gridView.teamIterations} iteration={startIteration} />
                        </div>
                        <div className="custom-duration-iteration">
                            <IterationRenderer teamIterations={this.props.gridView.teamIterations} iteration={endIteration} />
                        </div>
                    </div>
                </div>

                <div className="custom-duration-footer">
                    <div>
                        <Button onClick={this._onClear}>Clear</Button>
                    </div>
                    <div>
                        <PrimaryButton onClick={() => this.props.closeDetails(this._getId())}>Close</PrimaryButton>
                    </div>
                </div>
            </div>

        );
    }

    private _onClear = () => {
        this.props.clearOverrideIteration(this._getId());
        this.props.closeDetails(this._getId());
    }

    private _getId = () => {
        return this.props.rawState.workItemsToShowInfoFor[0];
    }
}

