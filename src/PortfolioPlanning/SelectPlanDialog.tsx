import * as React from "react";
import * as ReactDOM from "react-dom";
import { iePollyfill } from "../polyfill";
import { PortfolioPlanningDirectory } from "./Models/PortfolioPlanningQueryModels";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { ScrollableList, ListSelection, IListItemDetails, ListItem } from "azure-devops-ui/List";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { FormItem } from "azure-devops-ui/FormItem";
import { PortfolioPlanningDataService } from "./Common/Services/PortfolioPlanningDataService";
import { PortfolioTelemetry } from "./Common/Utilities/Telemetry";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        let inputData: IDialogInputData = VSS.getConfiguration();
        ReactDOM.render(<SelectPlanComponent inputData={inputData} />, document.getElementById("root"));
    }
}

export function unmount(): void {
    if (!isBackground()) {
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
    }
}

function isBackground() {
    const contributionContext = VSS.getConfiguration();
    return contributionContext.host && contributionContext.host.background;
}

export interface IDialogInputData {
    workItemIds: number[];
    directory: PortfolioPlanningDirectory;
    setOnOkClickHandler: (onOkClickHandler: () => IPromise<void>) => void;
}

export interface ISelectPlanComponentProps {
    inputData: IDialogInputData;
}

export interface ISelectPlanComponentState {
    errorMessage: string;
}

class SelectPlanComponent extends React.Component<ISelectPlanComponentProps, ISelectPlanComponentState> {
    private selection = new ListSelection({ multiSelect: false });
    private indexToPlan: { [index: number]: string } = {};

    constructor(props, context) {
        super(props, context);
        this.props.inputData.setOnOkClickHandler(this.onOkClicked);
        this.state = {
            errorMessage: null
        };
    }

    public render(): JSX.Element {
        const items: IListBoxItem[] = this.props.inputData.directory.entries.map(plan => {
            return {
                id: plan.id,
                text: plan.name
            };
        });

        return (
            <FormItem message={this.state.errorMessage} error={!!this.state.errorMessage}>
                <ScrollableList
                    itemProvider={new ArrayItemProvider<IListBoxItem>(items)}
                    renderRow={this.renderRow}
                    selection={this.selection}
                    width="100%"
                />
            </FormItem>
        );
    }

    private renderRow = (
        index: number,
        item: IListBoxItem,
        details: IListItemDetails<IListBoxItem>,
        key?: string
    ): JSX.Element => {
        this.indexToPlan[index] = item.id;
        return (
            <ListItem key={key || "list-item" + index} index={index} details={details}>
                <span>{item.text}</span>
            </ListItem>
        );
    };

    private onOkClicked = async (): Promise<void> => {
        if (this.selection.value && this.selection.value[0] && this.selection.value[0].beginIndex) {
            const planSelected = this.indexToPlan[this.selection.value[0].beginIndex];
            const workItemIds = this.props.inputData.workItemIds;

            const plan = await PortfolioPlanningDataService.getInstance().AddWorkItemsToPlan(planSelected, workItemIds);
            if (!plan) {
                //  TODO    Error scenario handling - e.g. plan doesn't exist.
                //  Something went wrong. A valid plan should have been returned.
                const errorMessage = `[Dialog] Failed to add work item ids (${workItemIds.join(
                    ", "
                )}) to plan '${planSelected}'`;
                console.log(errorMessage);
                PortfolioTelemetry.getInstance().TrackException(new Error(errorMessage));
            }

            return;
        } else {
            this.setState({
                errorMessage: "Please select a plan"
            });

            return Promise.reject(new Error("Select Portfolio plan - No plan selected"));
        }
    };
}
