import * as React from "react";
import "./NewPlanDialog.scss";
import { CustomDialog } from "azure-devops-ui/Dialog";
import { CustomHeader, HeaderTitleArea } from "azure-devops-ui/Header";
import { PanelContent, PanelFooter } from "azure-devops-ui/Panel";
import { TextField, TextFieldWidth, ITextField } from "azure-devops-ui/TextField";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Button } from "azure-devops-ui/Button";
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import { FormItem } from "azure-devops-ui/FormItem";

export interface NewPlanDialogProps {
    existingPlanNames: string[];
    onDismiss: () => void;
    onCreate: (name: string, description: string) => void;
}

interface NewPlanDialogState {
    nameErrorMessage: string;
    descriptionErrorMessage: string;
}

const nameMaxLength = 50;
const descriptionMaxLength = 100;

export default class NewPlanDialog extends React.Component<NewPlanDialogProps, NewPlanDialogState> {
    private nameObservable = new ObservableValue<string>("");
    private descriptionObservable = new ObservableValue<string>("");
    private nameTextFieldRef: ITextField;

    constructor(props) {
        super(props);

        this.state = { nameErrorMessage: "", descriptionErrorMessage: "" };
    }

    public componentDidMount() {
        if (this.nameTextFieldRef) {
            this.nameTextFieldRef.focus();
        }
    }

    public render() {
        return (
            <CustomDialog
                className="new-plan-dialog"
                onDismiss={this.props.onDismiss}
                modal={true}
                defaultActiveElement="name-text-field"
            >
                <CustomHeader>
                    <HeaderTitleArea className="title-m">Create a new plan</HeaderTitleArea>
                </CustomHeader>
                <PanelContent>
                    <div className="text-field-container">
                        <FormItem message={this.state.nameErrorMessage} error={this.state.nameErrorMessage !== ""}>
                            <TextField
                                ref={this._setNameTextFieldRef}
                                className="text-field name-text-field"
                                value={this.nameObservable}
                                onChange={this._onNameChange}
                                width={TextFieldWidth.auto}
                                placeholder="Add your plan name"
                                autoFocus={true}
                            />
                        </FormItem>
                        <FormItem
                            message={this.state.descriptionErrorMessage}
                            error={this.state.descriptionErrorMessage !== ""}
                        >
                            <TextField
                                className="text-field"
                                value={this.descriptionObservable}
                                onChange={this._onDescriptionChange}
                                multiline
                                rows={3}
                                width={TextFieldWidth.auto}
                                placeholder="Add your plan description..."
                            />
                        </FormItem>
                    </div>
                </PanelContent>
                <PanelFooter>
                    <ButtonGroup className="buttons">
                        <Button text="Cancel" onClick={this.props.onDismiss} />
                        <Button
                            text="Create"
                            primary={true}
                            onClick={() => {
                                this.props.onCreate(
                                    this.nameObservable.value.trim(),
                                    this.descriptionObservable.value.trim()
                                );
                            }}
                            disabled={
                                this.nameObservable.value === "" ||
                                this.state.nameErrorMessage !== "" ||
                                this.state.descriptionErrorMessage !== ""
                            }
                        />
                    </ButtonGroup>
                </PanelFooter>
            </CustomDialog>
        );
    }

    private _onNameChange = (e, newValue: string): void => {
        const trimmedName = newValue.trim().toLowerCase();

        if (newValue.length > nameMaxLength) {
            this.setState({
                nameErrorMessage: `Name can't be longer than ${nameMaxLength} characters.`
            });
        } else if (this.props.existingPlanNames.some(name => name.toLowerCase() === trimmedName)) {
            this.setState({
                nameErrorMessage: `The plan "${newValue}" already exists.`
            });
        } else {
            this.setState({ nameErrorMessage: "" });
        }

        this.nameObservable.value = newValue;
    };

    private _onDescriptionChange = (e, newValue: string): void => {
        if (newValue.length > descriptionMaxLength) {
            this.setState({
                descriptionErrorMessage: `Description can't be longer than ${descriptionMaxLength} characters.`
            });
        } else {
            this.setState({ descriptionErrorMessage: "" });
        }

        this.descriptionObservable.value = newValue;
    };

    private _setNameTextFieldRef = (textField: ITextField): void => {
        if (!this.nameTextFieldRef) {
            this.nameTextFieldRef = textField;
        }
    };
}
