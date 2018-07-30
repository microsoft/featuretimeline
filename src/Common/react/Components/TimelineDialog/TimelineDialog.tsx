import './TimelineDialog.scss'
import * as React from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { IterationDurationComponent } from '../IterationDuration/IterationDuration';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { IWorkItemOverrideIteration } from '../../../redux/modules/OverrideIterations/overriddenIterationContracts';
import { IIterationDuration } from '../../../redux/Contracts/IIterationDuration';

export interface ITimelineDialogProps {
    id: number;
    title: string;
    iterationDuration: IIterationDuration;
    teamIterations: TeamSettingsIteration[];
    backlogIteration: TeamSettingsIteration;
    closeDetails: (id: number) => void;
    clearOverrideIteration: (id: number) => void;
    saveOverrideIteration: (payload: IWorkItemOverrideIteration) => void;
}

export class TimelineDialog extends React.Component<ITimelineDialogProps, {}> {
    public render() {
        const dialogDetails = this._getCustomIterationDurationDetails();

        const {
            title
        } = this.props;
        return (
            <Dialog
                hidden={false}
                onDismiss={() => this.props.closeDetails(this.props.id)}
                dialogContentProps={
                    {
                        type: DialogType.close,
                        title
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

    private _getCustomIterationDurationDetails= () => {
        const {
            backlogIteration,
            teamIterations,
            iterationDuration
        } = this.props;

        return (
            <div className="dialog-contents">
                <div className="dialog-grid-container">
                    {this.props.children}
                </div>

                <div className="custom-duration-container">
                    <IterationDurationComponent
                        iterationDuration={iterationDuration}
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

