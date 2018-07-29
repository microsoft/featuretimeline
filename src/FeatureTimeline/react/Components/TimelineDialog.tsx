import './TimelineDialog.scss'
import * as React from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { FeatureTimelineGrid, IFeatureTimelineGridProps } from './FeatureTimelineGrid';
import { getGridView } from '../../redux/selectors/FeatureTimelineGridViewSelector';
import { getTeamIterations } from '../../redux/selectors/teamIterations';
import { IterationDurationComponent } from '../../../Common/react/Components/IterationDuration/IterationDuration';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';

export interface ITimelineDialogProps extends IFeatureTimelineGridProps {
    id: number;
    clearOverrideIteration: (id: number) => void;
}

export class TimelineDialog extends React.Component<ITimelineDialogProps, {}> {
    public render() {
        const gridWorkItem = this._getGridWorkItem();
        const dialogDetails = this._getCustomIterationDurationDetails();

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
        return this.props.gridView.workItems.filter(w => w.workItem.id === this.props.id)[0];
    }

    private _getCustomIterationDurationDetails() {
        const gridWorkItem = this._getGridWorkItem();
        const {
            backlogIteration,
            teamIterations
        } = this.props.gridView;

        return (
            <div className="dialog-contents">
                <div className="dialog-grid-container">
                    {this._getChildrenFeatureTimelineGrid()}
                </div>

                <div className="custom-duration-container">
                    <IterationDurationComponent
                        iterationDuration={gridWorkItem.workItem.iterationDuration}
                        teamIterations={teamIterations}
                        backlogIteration={backlogIteration}
                        onClear={this._onClear}
                        onOverrideIteration={this._onOverrideIteration}
                        onCancel={this._onClose}

                    />
                </div>
            </div>

        );
    }
    private _onOverrideIteration = (startIteration: TeamSettingsIteration, endIteration: TeamSettingsIteration) => {
        this._onClose();
        this.props.saveOverrideIteration({
            workItemId: this.props.id,
            iterationDuration: {
                startIterationId: startIteration.id,
                endIterationId: endIteration.id,
                user: VSS.getWebContext().user.uniqueName
            },
            changingStart: false
        });
    }

    private _onClose = () => {
        this.props.closeDetails(this.props.id);
    }

    private _onClear = () => {
        this._onClose();
        this.props.clearOverrideIteration(this.props.id);
    }
}

