import "./IterationDuration.scss";
import * as React from "react";
import { IIterationDuration, IterationDurationKind } from "../../../redux/Contracts/IIterationDuration";
import { TeamSettingsIteration } from "azure-devops-extension-api/Work";
import { ComboBox, IComboBoxOption } from "office-ui-fabric-react/lib/ComboBox";
import { Button, PrimaryButton } from "office-ui-fabric-react/lib/Button";

export interface IIterationDurationComponentProps {
    iterationDuration: IIterationDuration;
    teamIterations: TeamSettingsIteration[];
    backlogIteration: TeamSettingsIteration;
    onOverrideIteration: (start: TeamSettingsIteration, end: TeamSettingsIteration) => void;
    onClear: () => void;
    onCancel: () => void;
}

interface IIterationDurationComponentState {
    startIteration: TeamSettingsIteration;
    endIteration: TeamSettingsIteration;
    isValid: boolean;
    errorMessage: string;
}

export class IterationDurationComponent extends React.Component<IIterationDurationComponentProps, IIterationDurationComponentState> {
    public constructor(props: IIterationDurationComponentProps, context) {
        super(props, context);
        this.state = {
            startIteration: props.iterationDuration.startIteration,
            endIteration: props.iterationDuration.endIteration,
            isValid: true,
            errorMessage: null
        };
    }
    public render() {
        let {
            iterationDuration: {
                kindMessage,
                kind,
                overridedBy
            },
            onClear
        } = this.props;

        const {
            errorMessage,
            isValid,
            startIteration,
            endIteration
        } = this.state;

        if (kind === IterationDurationKind.UserOverridden) {
            kindMessage = `${overridedBy} has set start and end iteration for this workitem.`;
        }

        const isDirty = this._isDirty();
        const saveText = isDirty ? "Save and Close" : "Close";

        return (
            <div className="iteration-duration-component">
                <div className="iteration-duration-form">
                    <div className="iteration-duration-column">
                        <div className="iteration-duration-title">
                            Start Iteration
                        </div>
                        <div>
                            <ComboBox
                                options={this._getComboBoxOptions()}
                                selectedKey={startIteration.id}
                                autoComplete="on"
                                onChanged={this._startIterationChanged}
                            />
                        </div>
                    </div>
                    <div className="iteration-duration-column">
                        <div className="iteration-duration-title">
                            End Iteration
                        </div>
                        <div>
                            <ComboBox
                                options={this._getComboBoxOptions()}
                                selectedKey={endIteration.id}
                                autoComplete="on"
                                onChanged={this._endIterationChanged}
                            />
                        </div>
                    </div>
                </div>
                <div className="iteration-duration-kind-message">
                    {!errorMessage && kindMessage}
                </div>
                <div className="iteration-duration-error-message">
                    {errorMessage}
                </div>
                <div className="iteration-duration-commands">
                    {
                        kind === IterationDurationKind.UserOverridden &&
                        <Button className="iteration-duration-button" onClick={onClear}>Clear Iterations</Button>
                    }
                    {
                        isDirty && <Button className="iteration-duration-button" onClick={this.props.onCancel}>Cancel</Button>
                    }
                    {
                        <PrimaryButton
                            className="iteration-duration-button"
                            onClick={this._setIteration}
                            disabled={!isValid}>
                            {saveText}
                        </PrimaryButton>
                    }
                </div>
            </div>
        );
    }

    private _startIterationChanged = (item: IComboBoxOption) => {
        this._validate(item.key as string, this.state.endIteration.id);
    }

    private _endIterationChanged = (item: IComboBoxOption) => {
        this._validate(this.state.startIteration.id, item.key as string);
    }

    private _validate = (startId: string, endId: string) => {
        const {
            backlogIteration,
            teamIterations
        } = this.props;
        let state: IIterationDurationComponentState = {
            isValid: true,
            errorMessage: undefined,
            startIteration: this._getIteration(startId),
            endIteration: this._getIteration(endId)
        } as IIterationDurationComponentState;

        // Validate that both should be backlog iteration
        if ((startId === backlogIteration.id
            || endId === backlogIteration.id)) {

            if (startId !== endId) {
                state = {
                    ...state,
                    isValid: false,
                    errorMessage: "Both start iteration and end iteration should be backlog iteration."
                } as IIterationDurationComponentState;
            }

        } else {
            // Validate that startiteration should be before or equal to end iteration
            const startIndex = teamIterations.findIndex(i => i.id === startId);
            const endIndex = teamIterations.findIndex(i => i.id === endId);

            if (startIndex > endIndex) {
                state = {
                    ...state,
                    isValid: false,
                    errorMessage: "Start iteration should not be later than iteration."
                } as IIterationDurationComponentState;
            }
        }

        this.setState(state);
    }

    private _getIteration = (id: string): TeamSettingsIteration => {
        const {
            backlogIteration,
            teamIterations
        } = this.props;

        if (id === backlogIteration.id) {
            return backlogIteration;
        }

        return teamIterations.find(i => i.id === id);
    }

    private _setIteration = () => {
        const {
            startIteration,
            endIteration
        } = this.state;


        if (!this._isDirty()) {
            this.props.onCancel();
        }
        else {
            this.props.onOverrideIteration(startIteration, endIteration);
        }
    }

    private _isDirty = () => {
        const {
            startIteration,
            endIteration
        } = this.state;

        const {
            iterationDuration
        } = this.props;

        return startIteration.id !== iterationDuration.startIteration.id ||
            endIteration.id !== iterationDuration.endIteration.id;

    }

    private _getComboBoxOptions = () => {
        const {
            teamIterations,
            backlogIteration
        } = this.props;

        return teamIterations.map((i) => {
            return {
                key: i.id,
                text: i.path
            }
        }).concat([{
            key: backlogIteration.id,
            text: (backlogIteration.path || backlogIteration.name) + " ( Backlog )"
        }]);
    }
}