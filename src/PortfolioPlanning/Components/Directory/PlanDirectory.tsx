import * as React from "react";
import "./PlanDirectory.scss";
import { Page } from "azure-devops-ui/Page";
import PlanDirectoryHeader from "./PlanDirectoryHeader";
import { PlanCard } from "./PlanCard";
import NewPlanDialog from "./NewPlanDialog";
import { PlanDirectoryActions } from "../../Redux/Actions/PlanDirectoryActions";
import { connect } from "react-redux";
import { IPortfolioPlanningState } from "../../Redux/Contracts";
import { ConnectedPlanPage } from "../Plan/PlanPage";
import { PortfolioPlanningMetadata } from "../../Models/PortfolioPlanningQueryModels";
import { EpicTimelineActions } from "../../Redux/Actions/EpicTimelineActions";
import { LoadingStatus } from "../../Contracts";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";
import { ZeroDataActionType, ZeroData } from "azure-devops-ui/ZeroData";

export interface IPlanDirectoryProps {}

interface IPlanDirectoryMappedProps {
    directoryLoadingStatus: LoadingStatus;
    exceptionMessage: string;
    selectedPlanId: string;
    plans: PortfolioPlanningMetadata[];
    newPlanDialogVisible: boolean;
}

export class PlanDirectory extends React.Component<IPlanDirectoryProps & IPlanDirectoryMappedProps & typeof Actions> {
    constructor(props) {
        super(props);
    }

    public render() {
        if (this.props.selectedPlanId) {
            return <ConnectedPlanPage />;
        } else {
            return (
                <Page className="plan-page">
                    <PlanDirectoryHeader
                        newPlanButtonDisabled={this.props.directoryLoadingStatus !== LoadingStatus.Loaded}
                        onNewPlanClick={() => {
                            this.props.toggleNewPlanDialogVisible(true);
                        }}
                    />
                    {this._renderDirectoryContent()}
                    {this._renderNewPlanDialog()}
                </Page>
            );
        }
    }

    private _renderDirectoryContent = (): JSX.Element => {
        if (this.props.directoryLoadingStatus === LoadingStatus.NotLoaded) {
            return (
                <Spinner
                    className="page-content directory-loading-spinner"
                    label="Loading..."
                    size={SpinnerSize.large}
                />
            );
        } else {
            const exceptionMessageCard = (
                <MessageCard className="flex-self-stretch exception-message-card" severity={MessageCardSeverity.Error}>
                    {this.props.exceptionMessage}
                </MessageCard>
            );

            let content =
                this.props.plans.length > 0 ? (
                    <div className="plan-cards-container">
                        {this.props.plans.map(plan => (
                            <PlanCard
                                planId={plan.id}
                                name={plan.name}
                                description={plan.description}
                                teams={plan.teamNames}
                                projects={plan.projectNames}
                                owner={plan.owner}
                                onClick={id => this.props.toggleSelectedPlanId(id)}
                            />
                        ))}
                    </div>
                ) : (
                    // TODO: Add zero data images
                    <ZeroData
                        imagePath=""
                        imageAltText=""
                        primaryText="Get started with portfolio plans"
                        secondaryText="Use the &quot;New Plan&quot; button to create a plan and add items to it"
                        actionText="New plan"
                        actionType={ZeroDataActionType.ctaButton}
                        onActionClick={() => this.props.toggleNewPlanDialogVisible(true)}
                    />
                );

            return (
                <div className="page-content plan-directory-page-content">
                    {this.props.exceptionMessage && exceptionMessageCard}
                    {content}
                </div>
            );
        }
    };

    private _renderNewPlanDialog = (): JSX.Element => {
        return (
            this.props.newPlanDialogVisible && (
                <NewPlanDialog
                    existingPlanNames={this.props.plans.map(plan => plan.name)}
                    onDismiss={() => this.props.toggleNewPlanDialogVisible(false)}
                    onCreate={(name: string, description: string) => this.props.createPlan(name, description)}
                />
            )
        );
    };
}

function mapStateToProps(state: IPortfolioPlanningState): IPlanDirectoryMappedProps {
    return {
        directoryLoadingStatus: state.planDirectoryState.directoryLoadingStatus,
        exceptionMessage: state.planDirectoryState.exceptionMessage,
        selectedPlanId: state.planDirectoryState.selectedPlanId,
        plans: state.planDirectoryState.plans,
        newPlanDialogVisible: state.planDirectoryState.newPlanDialogVisible
    };
}

const Actions = {
    createPlan: PlanDirectoryActions.createPlan,
    deletePlan: PlanDirectoryActions.deletePlan,
    toggleSelectedPlanId: PlanDirectoryActions.toggleSelectedPlanId,
    toggleNewPlanDialogVisible: PlanDirectoryActions.toggleNewPlanDialogVisible,
    togglePlanLoadingStatus: EpicTimelineActions.toggleLoadingStatus,
    resetPlanState: EpicTimelineActions.resetPlanState
};

export const ConnectedPlanDirectory = connect(
    mapStateToProps,
    Actions
)(PlanDirectory);
