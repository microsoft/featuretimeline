import * as React from "react";
import * as moment from "moment";
import { Dialog, DialogType, DialogFooter } from "office-ui-fabric-react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";
import { DatePicker, IDatePickerStrings } from "office-ui-fabric-react/lib/DatePicker";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";

initializeIcons();

export interface ISetDatesDialogProps {
    id: number;
    title: string;
    startDate: moment.Moment;
    endDate: moment.Moment;
    hidden: boolean;
    save: (id: number, startDate: moment.Moment, endDate: moment.Moment) => void;
    close: () => void;
}

interface ISetDatesDialogState {
    selectedStartDate: moment.Moment;
    selectedEndDate: moment.Moment;
}

const datePickerStrings: IDatePickerStrings = {
    months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],

    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

    shortDays: ["S", "M", "T", "W", "T", "F", "S"],

    goToToday: "Go to today",
    prevMonthAriaLabel: "Go to previous month",
    nextMonthAriaLabel: "Go to next month",
    prevYearAriaLabel: "Go to previous year",
    nextYearAriaLabel: "Go to next year"
};

export class DetailsDialog extends React.Component<ISetDatesDialogProps, ISetDatesDialogState> {
    constructor(props) {
        super(props);

        this.state = {
            selectedStartDate: this.props.startDate,
            selectedEndDate: this.props.endDate
        };
    }

    public render() {
        const errorMessage = this._getErrorMessage();

        return (
            <Dialog
                hidden={this.props.hidden}
                onDismiss={this._onCancelDialog}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: `Details for ${this.props.title}`
                }}
            >
                Start Date:
                <DatePicker
                    value={this.state.selectedStartDate.toDate()}
                    onSelectDate={this._onSetSelectedStartDate}
                    strings={datePickerStrings}
                />
                End Date:
                <DatePicker
                    value={this.state.selectedEndDate.toDate()}
                    onSelectDate={this._onSetSelectedEndDate}
                    strings={datePickerStrings}
                />
                {errorMessage}
                <DialogFooter>
                    <PrimaryButton onClick={this._onSaveDialog} disabled={!!errorMessage} text="Save" />
                    <DefaultButton onClick={this._onCancelDialog} text="Cancel" />
                </DialogFooter>
            </Dialog>
        );
    }

    private _onSaveDialog = (): void => {
        this.props.save(this.props.id, this.state.selectedStartDate, this.state.selectedEndDate);
        this.props.close();
    };

    private _onCancelDialog = (): void => {
        this.props.close();
    };

    private _onSetSelectedStartDate = (date: Date): void => {
        this.setState({ selectedStartDate: moment(date) });
    };

    private _onSetSelectedEndDate = (date: Date): void => {
        this.setState({ selectedEndDate: moment(date) });
    };

    private _getErrorMessage = (): JSX.Element => {
        if (this.state.selectedStartDate > this.state.selectedEndDate) {
            return <div style={{ color: "red" }}>Start date must be before end date.</div>;
        } else {
            return null;
        }
    };
}
