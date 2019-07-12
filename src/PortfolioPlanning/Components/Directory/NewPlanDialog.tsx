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
    errorMessage: string;
}

export default class NewPlanDialog extends React.Component<NewPlanDialogProps, NewPlanDialogState> {
    private nameObservable = new ObservableValue<string>("");
    private descriptionObservable = new ObservableValue<string>("");
    private nameTextFieldRef: ITextField;

    constructor(props) {
        super(props);

        this.state = { errorMessage: "" };
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
                        <FormItem message={this.state.errorMessage} error={this.state.errorMessage !== ""}>
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
                        <TextField
                            className="text-field"
                            value={this.descriptionObservable}
                            onChange={(e, newValue) => (this.descriptionObservable.value = newValue)}
                            multiline
                            rows={4}
                            width={TextFieldWidth.auto}
                            placeholder="Add your plan description..."
                        />
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
                            disabled={this.nameObservable.value === "" || this.state.errorMessage !== ""}
                        />
                    </ButtonGroup>
                </PanelFooter>
            </CustomDialog>
        );
    }

    private _onNameChange = (e, newValue: string): void => {
        const trimmedName = newValue.trim().toLowerCase();

        if (this.props.existingPlanNames.some(name => name.toLowerCase() === trimmedName)) {
            this.setState({
                errorMessage: `The plan "${newValue}" already exists.`
            });
        } else {
            this.setState({ errorMessage: "" });
        }

        this.nameObservable.value = newValue;
    };

    private _setNameTextFieldRef = (textField: ITextField): void => {
        if (!this.nameTextFieldRef) {
            this.nameTextFieldRef = textField;
        }
    };
}
