import * as React from "react";
import {
  Dialog,
  DialogType,
  DialogFooter
} from "office-ui-fabric-react/lib/Dialog";
import {
  PrimaryButton,
  DefaultButton
} from "office-ui-fabric-react/lib/Button";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { IEpic } from "../Contracts";
import "./AddEpicDialog.scss";

export interface IAddEpicDialogProps {
  onCloseAddEpicDialog: () => void;
  otherEpics: IEpic[];
  onAddEpics: (epicsToAdd: IEpic[]) => void;
}

interface IAddEpicDialogState {
  //epicIds: number[];
  inputEpicIds: string;
  epicsToAdd: IEpic[];
}
export class AddEpicDialog extends React.Component<
  IAddEpicDialogProps,
  IAddEpicDialogState
> {
  constructor(props) {
    super(props);
    this.state = { inputEpicIds: "", epicsToAdd: [] };
  }
  public render() {
    return (
      <Dialog
        hidden={false}
        onDismiss={() => this.props.onCloseAddEpicDialog()}
        dialogContentProps={{
          type: DialogType.close,
          title: "Add Epic",
          subText: "Enter id(s) of Epic you want to add, separate with comma"
        }}
        modalProps={{
          isBlocking: true
        }}
      >
        {this._renderSearchArea()}
        {this._renderListOfEpicsToAdd()}
        <DialogFooter>
          <PrimaryButton
            onClick={() => this._onAddEpics()}
            text="Add"
          />
          <DefaultButton
            onClick={() => this.props.onCloseAddEpicDialog()}
            text="Cancel"
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private _renderSearchArea = (): JSX.Element => {
    return (
      <div className="add-epic-dialog-search">
        <TextField
          placeholder="Please enter Epic id(s) here"
          value={this.state.inputEpicIds}
          onChanged={value => this._onEpicIdsChange(value)}
          className="add-epic-dialog-text"
        />
        <PrimaryButton
          className="add-epic-dialog-search-button"
          onClick={() => this._getEpics()}
          text="Search"
        />
      </div>
    );
  };

  private _renderListOfEpicsToAdd = (): JSX.Element[] => {
    if (this.state.epicsToAdd.length > 0) {
      return this.state.epicsToAdd.map(epic => (
        <li key={epic.id}>{epic.title}</li>
      ));
    }
  };

  private _onEpicIdsChange = (newValue: string): void => {
    const { inputEpicIds } = this.state;

    if (inputEpicIds !== newValue) {
      this.setState({ inputEpicIds: newValue });
    }
  };

  private _getEpics = (): void => {
    const epicIds: number[] = this.state.inputEpicIds
      .split(",")
      .map(epicId => parseInt(epicId));
    const epicsToAdd: IEpic[] = [];
    epicIds.map(id => {
      const index: number = this.props.otherEpics.findIndex(
        epic => epic.id === id
      );
      // TODO: show user what epics can not be found.
      if (index >= 0) {
        epicsToAdd.push(this.props.otherEpics[index]);
      }
    });
    this.setState({ epicsToAdd: epicsToAdd });
  };

  private _onAddEpics = (): void => {
      this.props.onAddEpics(this.state.epicsToAdd);
      this.props.onCloseAddEpicDialog()
  }
}
