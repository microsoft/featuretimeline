import './TimelineDialog.scss'
import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { FeatureTimelineGrid, IFeatureTimelineGridProps } from './FeatureTimelineGrid';
import { getGridView } from '../../redux/selectors/FeatureTimelineGridViewSelector';
import { getTeamIterations } from '../../redux/selectors/teamIterations';
import { IterationDurationKind } from "../../../Common/redux/Contracts/IIterationDuration";
import { IterationRenderer } from '../../../Common/react/Components/IterationRenderer';
import { Button, PrimaryButton } from 'office-ui-fabric-react/lib/Button';

export interface ITimelineDialogProps extends IFeatureTimelineGridProps {
    id: number;
    clearOverrideIteration: (id: number) => void;
}

export class TimelineDialog extends React.Component<ITimelineDialogProps, {}> {
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
                footer = (<DialogFooter>
                    <div>
                        <PrimaryButton onClick={() => this.props.closeDetails(this.props.id)}>Close</PrimaryButton>
                    </div>
                </DialogFooter>)

        }

        return (
            <Dialog
                hidden={false}
                onDismiss={() => this.props.closeDetails(this.props.id)}
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
        const gridWorkItem = this._getGridWorkItem();
        const gridView = getGridView(
            this.props.uiState,
            this.props.gridView.backlogIteration,
            getTeamIterations(this.props.projectId, this.props.teamId, this.props.uiState, this.props.rawState),
            [gridWorkItem.workItem],
            /* workItemOverrideIteration */ null,
            this.props.settingsState,
            /* iterationDisplayOptions */ null,
            /* isSubGrid */ true);

        const childItems = this.props.childItems.filter(id => id !== this.props.id);

        const props = { ...this.props, gridView, childItems };
        if (gridView.workItems.length > 0) {
            return (
                <FeatureTimelineGrid {...props}>
                </FeatureTimelineGrid>
            );
        }
        return null;
    }

    private _getGridWorkItem() {
        return this.props.gridView.workItems.filter(w => !w.isGap && w.workItem.id === this.props.id)[0];
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
                        <PrimaryButton onClick={() => this.props.closeDetails(this.props.id)}>Close</PrimaryButton>
                    </div>
                </div>
            </div>

        );
    }

    private _onClear = () => {
        this.props.closeDetails(this.props.id);
        this.props.clearOverrideIteration(this.props.id);
    }
}

