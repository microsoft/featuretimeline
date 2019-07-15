import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { ComboBox } from 'office-ui-fabric-react/lib/ComboBox';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import InputNum from "rc-input-number";
import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect, Provider } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { IterationDropTarget } from '../../../Common/react/Components/DroppableIterationShadow';
import { IterationRenderer } from '../../../Common/react/Components/IterationRenderer';
import { ChildRowsSeparator } from '../../../Common/react/Components/WorkItem/ChildRowsSeparatorGap';
import { DraggableWorkItemRenderer } from '../../../Common/react/Components/WorkItem/DraggableWorkItemRenderer';
import { WorkItemShadow } from '../../../Common/react/Components/WorkItem/WorkItemShadow';
import { ConnectedWorkItemsList } from '../../../Common/react/Components/WorkItemList';
import { launchWorkItemForm } from "../../../Common/redux/actions/launchWorkItemForm";
import { startUpdateWorkItemIteration } from '../../../Common/redux/actions/StartUpdateWorkitemIterationAction';
import { IGridView } from '../../../Common/redux/Contracts/GridViewContracts';
import { UIStatus } from '../../../Common/redux/Contracts/types';
import { getRowColumnStyle, getTemplateColumns } from '../../../Common/redux/Helpers/gridhelper';
import { changeDisplayIterationCount, displayAllIterations, shiftDisplayIterationLeft, shiftDisplayIterationRight } from '../../../Common/redux/modules/IterationDisplayOptions/IterationDisplayOptionsActions';
import { saveOverrideIteration, endOverrideIteration, overrideHoverOverIteration, startOverrideIteration } from '../../../Common/redux/modules/overrideIterationProgress/overrideIterationProgressActionCreators';
import { IWorkItemOverrideIteration } from '../../../Common/redux/modules/OverrideIterations/overriddenIterationContracts';
import { OverriddenIterationsActionCreator } from '../../../Common/redux/modules/OverrideIterations/overrideIterationsActions';
import { changeProgressTrackingCriteria, changeShowClosedSinceDays, toggleShowWorkItemDetails } from '../../../Common/redux/modules/SettingsState/SettingsStateActions';
import { ISettingsState, ProgressTrackingCriteria } from "../../../Common/redux/modules/SettingsState/SettingsStateContracts";
import { getSettingsState } from '../../../Common/redux/modules/SettingsState/SettingsStateSelector';
import { closeDetails, showDetails } from '../../../Common/redux/modules/ShowHideDetails/ShowHideDetailsActions';
import { getProjectId, getTeamId } from '../../../Common/redux/Selectors/CommonSelectors';
import configureFeatureTimelineStore from '../../redux/configureStore';
import { getBacklogLevel, getRawState, planFeatureStateSelector, primaryGridViewSelector, uiStatusSelector } from '../../redux/selectors';
import { changePlanFeaturesWidth, createInitialize, togglePlanFeaturesPane } from '../../redux/store/common/actioncreators';
import { IFeatureTimelineRawState, IPlanFeaturesState } from '../../redux/store/types';
import { startMarkInProgress } from '../../redux/store/workitems/actionCreators';
import './FeatureTimelineGrid.scss';
import { FeatureTimelineDialog } from './FeatureTimelineDialog';
import { PromotePortfolioPlans } from '../../../Common/react/Components/PromotePortfolioPlans';

initializeIcons(/* optional base url */);

export interface IFeatureTimelineGridProps {
    projectId: string;
    teamId: string;
    rawState: IFeatureTimelineRawState;
    uiState: UIStatus;
    gridView: IGridView,
    childItems: number[];
    planFeaturesState: IPlanFeaturesState;
    settingsState: ISettingsState;
    launchWorkItemForm: (id: number) => void;
    showDetails: (id: number) => void;
    closeDetails: (id: number) => void;
    clearOverrideIteration: (id: number) => void;
    dragHoverOverIteration: (iteration: string) => void;
    overrideIterationStart: (payload: IWorkItemOverrideIteration) => void;
    saveOverrideIteration: (payload: IWorkItemOverrideIteration) => void;
    overrideIterationEnd: () => void;
    changeIteration: (id: number, teamIteration: TeamSettingsIteration, override: boolean) => void;
    showNIterations: (projectId: string, teamId: string, count: Number, maxIterations: number, currentIterationIndex: number) => void;
    shiftDisplayIterationLeft: (maxIterations: number) => void;
    shiftDisplayIterationRight: (maxIterations: number) => void;
    showAllIterations: () => void;
    togglePlanFeaturesPane: (show: boolean) => void;
    resizePlanFeaturesPane: (width: number) => void;
    markInProgress: (id: number, teamIteration: TeamSettingsIteration) => void;
    toggleShowWorkItemDetails: (show: boolean) => void;
    changeProgressTrackingCriteria: (criteria: ProgressTrackingCriteria) => void;
    changeShowClosedSinceDays: (days: number) => void;
}

const makeMapStateToProps = () => {
    return (state: IFeatureTimelineRawState) => {
        return {
            projectId: getProjectId(),
            teamId: getTeamId(),
            rawState: getRawState(state),
            uiState: uiStatusSelector()(state),
            gridView: primaryGridViewSelector()(state),
            childItems: state.workItemsToShowInfoFor,
            planFeaturesState: planFeatureStateSelector()(state),
            settingsState: getSettingsState(state)
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        launchWorkItemForm: (id: number) => {
            if (id) {
                dispatch(launchWorkItemForm(id));
            }
        },
        showDetails: (id: number) => {
            dispatch(showDetails(id));
        },
        closeDetails: (id: number) => {
            dispatch(closeDetails(id));
        },
        dragHoverOverIteration: (iterationId: string) => {
            dispatch(overrideHoverOverIteration(iterationId));
        },
        overrideIterationStart: (payload: IWorkItemOverrideIteration) => {
            dispatch(startOverrideIteration(payload));
        },
        saveOverrideIteration: (payload: IWorkItemOverrideIteration) => {
            dispatch(saveOverrideIteration(payload));
        },
        overrideIterationEnd: () => {
            dispatch(endOverrideIteration());
        },
        clearOverrideIteration: (id: number) => {
            dispatch(OverriddenIterationsActionCreator.clear(id));
        },
        changeIteration: (id: number, teamIteration: TeamSettingsIteration, override: boolean) => {
            dispatch(startUpdateWorkItemIteration([id], teamIteration, override));
        },
        markInProgress: (id: number, teamIteration: TeamSettingsIteration, state: string) => {
            dispatch(startMarkInProgress(id, teamIteration, state));
        },
        showNIterations: (projectId: string, teamId: string, count: Number, maxIterations: number, currentIterationIndex: number) => {
            dispatch(changeDisplayIterationCount(count, projectId, teamId, maxIterations, currentIterationIndex));
        },
        showAllIterations: () => {
            dispatch(displayAllIterations());
        },
        shiftDisplayIterationLeft: (maxIterations: number) => {
            dispatch(shiftDisplayIterationLeft(1, maxIterations));
        },
        shiftDisplayIterationRight: (maxIterations: number) => {
            dispatch(shiftDisplayIterationRight(1, maxIterations));
        },
        togglePlanFeaturesPane: (show: boolean) => {
            dispatch(togglePlanFeaturesPane(show));
        },
        toggleShowWorkItemDetails: (show: boolean) => {
            dispatch(toggleShowWorkItemDetails(show));
        },
        changeProgressTrackingCriteria: (criteria: ProgressTrackingCriteria) => {
            dispatch(changeProgressTrackingCriteria(criteria));
        },
        changeShowClosedSinceDays: (days: number) => {
            dispatch(changeShowClosedSinceDays(days));
        },
        resizePlanFeaturesPane: (width: number) => {
            dispatch(changePlanFeaturesWidth(width));
        }
    };
};

interface IFeatureTimelineGridState {

}

export class FeatureTimelineGrid extends React.Component<IFeatureTimelineGridProps, IFeatureTimelineGridState> {
    constructor() {
        super();
        this.state = {

        };
    }

    public render(): JSX.Element {

        const {
            uiState,
            rawState,
            settingsState
        } = this.props;
        if (!rawState || uiState === UIStatus.Loading) {
            return (
                <Spinner size={SpinnerSize.large} className="loading-indicator" label="Loading..." />
            );
        }

        if (rawState.error) {
            return (
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={false}
                >
                    {rawState.error}
                </MessageBar>
            );
        }

        if (uiState === UIStatus.NoTeamIterations) {
            return (
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={false}
                >
                    {"The team does not have any iteration selected, please visit team admin page and select team iterations."}
                </MessageBar>
            );
        }

        if (uiState === UIStatus.NoWorkItems) {
            return (<MessageBar
                messageBarType={MessageBarType.info}
                isMultiline={false}
            >
                {"No in-progress Features for the timeline."}
            </MessageBar>);
        }

        const {
            emptyHeaderRow,
            iterationHeader,
            iterationShadow,
            workItems,
            separators,
            shadowForWorkItemId,
            iterationDisplayOptions,
            isSubGrid,
            teamIterations
        } = this.props.gridView;

        const columnHeading = iterationHeader.map((iteration, index) => {
            const style = getRowColumnStyle(iteration.dimension);
            return (
                <div className="columnheading" style={style}>
                    <IterationRenderer teamIterations={teamIterations} iteration={iteration.teamIteration} />
                </div>
            );

        });

        const shadows = iterationShadow.map((shadow, index) => {
            return (
                <IterationDropTarget
                    {...shadow}
                    isOverrideIterationInProgress={!!rawState.workItemOverrideIteration}
                    onOverrideIterationOver={this.props.dragHoverOverIteration.bind(this)}
                    changeIteration={this.props.changeIteration.bind(this)}
                    markInProgress={this.props.markInProgress.bind(this)}
                >
                    &nbsp;
                </IterationDropTarget>
            );
        });

        let workItemShadowCell = null;
        if (shadowForWorkItemId) {
            const workItem = workItems.filter(w => w.workItem.id === shadowForWorkItemId)[0];
            workItemShadowCell = (
                <WorkItemShadow dimension={workItem.dimension} twoRows={workItem.settingsState.showWorkItemDetails} />
            );
        }

        const workItemCells = workItems.filter(w => w.workItem.id).map(w => {
            return (
                <DraggableWorkItemRenderer
                    id={w.workItem.id}
                    title={w.workItem.title}
                    color={w.workItem.color}
                    isRoot={w.workItem.isRoot}
                    assignedTo={w.workItem.workItem.fields["System.AssignedTo"]}
                    iterationDuration={w.workItem.iterationDuration}
                    dimension={w.dimension}
                    onClick={id => this.props.launchWorkItemForm(id)}
                    showDetails={id => this.props.showDetails(id)}
                    overrideIterationStart={payload => this.props.overrideIterationStart(payload)}
                    overrideIterationEnd={() => this.props.overrideIterationEnd()}
                    allowOverrideIteration={w.allowOverrideIteration}
                    isSubGrid={this.props.gridView.isSubGrid}
                    progressIndicator={w.progressIndicator}
                    crop={w.crop}
                    workItemStateColor={w.workItem.workItemStateColor}
                    settingsState={w.settingsState}
                    efforts={w.workItem.efforts}
                    childrernWithNoEfforts={w.workItem.childrenWithNoEfforts}
                    isComplete={w.workItem.isComplete}
                    successors={w.workItem.successors}
                    predecessors={w.workItem.predecessors}
                    highlightPredecessorIcon={w.workItem.highlightPredecessorIcon}
                    highlighteSuccessorIcon={w.workItem.highlighteSuccessorIcon}
                    onHighlightDependencies={() => {}}
                    onDismissDependencies={() => {}}
                    teamFieldName={"System.AreaPath"}
                />
            );
        });

        const workItemSeparators = separators.map(d => {
            return (
                <ChildRowsSeparator {...d} />
            );
        });


        const extraColumns = this.props.gridView.hideParents ? [] : ['300px'];
        let min = '200px';
        if (isSubGrid) {
            min = '150px';
        }
        const gridStyle = getTemplateColumns(extraColumns, shadows.length, `minmax(${min}, 300px)`);

        let childDialog = null;
        if (this.props.childItems.length > 0) {
            const props = { ...this.props, id: this.props.childItems[0] };
            childDialog = <FeatureTimelineDialog {...props} />
        }

        let leftButton = <span className="non-button"></span>;
        if (iterationDisplayOptions && iterationDisplayOptions.startIndex > 0) {
            leftButton = (
                <IconButton
                    className="button"
                    onClick={() => this.props.shiftDisplayIterationLeft(teamIterations.length)}
                    iconProps={
                        {
                            iconName: "ChevronLeftSmall"
                        }
                    }
                >
                </IconButton>
            );
        }

        let rightButton = <span className="non-button"></span>;
        if (iterationDisplayOptions && iterationDisplayOptions.endIndex < (iterationDisplayOptions.totalIterations - 1)) {
            rightButton = (
                <IconButton
                    className="button"
                    onClick={() => this.props.shiftDisplayIterationRight(teamIterations.length)}
                    iconProps={
                        {
                            iconName: "ChevronRightSmall"
                        }
                    }
                >
                </IconButton>
            );
        }

        let displayOptions = null;
        let commandHeading = [];

        if (!isSubGrid && (iterationDisplayOptions || columnHeading.length > 3)) {
            let displayIterationCount = 0;
            if (iterationDisplayOptions) {
                displayIterationCount = iterationDisplayOptions.count;
            } else {
                displayIterationCount = teamIterations.length;
            }
            displayOptions = (
                <div className="iteration-options">
                    <div className="iteration-options-label">View Sprints: </div>
                    <InputNum
                        value={displayIterationCount}
                        min={1}
                        max={teamIterations.length}
                        step={1}
                        onChange={this._onViewChanged}
                    >
                    </InputNum>
                </div>
            );

            if (emptyHeaderRow.length === 1) {
                // Special case only one column
                let rowColumnStyle = getRowColumnStyle(emptyHeaderRow[0]);
                const commands = (
                    <div style={rowColumnStyle} className="single-column-commands">
                        <div className="command-left-section">
                            {leftButton}
                        </div>
                        <div className="command-right-section">
                            {rightButton}
                        </div>
                    </div>
                );

                commandHeading.push(commands);

            } else {
                // Add left button to first empty heading cell
                let rowColumnStyle = getRowColumnStyle(emptyHeaderRow[0]);
                const firstHeaderColumnCommand = (
                    <div style={rowColumnStyle} className="first-header-column-command">
                        {leftButton}
                    </div>
                );
                commandHeading.push(firstHeaderColumnCommand);

                // Add display options and right button on last empty heading cell
                rowColumnStyle = getRowColumnStyle(emptyHeaderRow[emptyHeaderRow.length - 1]);
                const lastHeaderColumnCommand = (
                    <div style={rowColumnStyle} className="last-header-column-command">
                        {rightButton}
                    </div>
                );
                commandHeading.push(lastHeaderColumnCommand);
            }
        }
        let progressTrackingCriteriaElement = null;
        const {
            showWorkItemDetails,
            progressTrackingCriteria,
            showClosedSinceDays
        } = settingsState;
        if (showWorkItemDetails) {
            const selectedKey = progressTrackingCriteria === ProgressTrackingCriteria.ChildWorkItems ? "child" : "efforts";
            progressTrackingCriteriaElement = (
                <div className="progress-options">
                    <div className="progress-options-label">Track Progress Using: </div>
                    <ComboBox
                        className="progress-options-dropdown"
                        selectedKey={selectedKey}
                        allowFreeform={false}
                        autoComplete='off'
                        options={
                            [
                                { key: 'child', text: 'Completed Stories' },
                                { key: 'efforts', text: 'Completed Efforts' }
                            ]
                        }
                        onChanged={this._onProgressTrackingCriteriaChanged}
                    >
                    </ComboBox>
                </div>
            );
        }

        const selectedKey = (showClosedSinceDays || '0').toString();

        const showClosedSinceDaysElement = (
            <div className="closed-since-options">
                <div className="show-closed-since-label">Closed Features: </div>
                <ComboBox
                    className="show-closed-since-dropdown"
                    selectedKey={selectedKey}
                    allowFreeform={false}
                    autoComplete='off'
                    options={
                        [
                            { key: '0', text: 'Do not show' },
                            { key: '30', text: 'Last 30 days' },
                            { key: '60', text: 'Last 60 days' },
                            { key: '90', text: 'Last 90 days' },
                            { key: '120', text: 'Last 120 days' },
                            { key: '180', text: 'Last 180 days' },
                            { key: '365', text: 'Last 1 year' },
                            { key: '9999', text: 'Forever (Slow)'}
                        ]
                    }
                    onChanged={this._onShowClosedSinceChanged}
                >
                </ComboBox>
            </div>
        );
        const commands = !isSubGrid && (
            <div className="header-commands">
                {displayOptions}

                <Checkbox
                    className="plan-feature-checkbox"
                    label={"Plan Features"}
                    onChange={this._onShowPlanFeaturesChanged}
                    checked={this.props.planFeaturesState.show} />

                <Checkbox
                    className="show-work-item-details-checkbox"
                    label={"Show Details"}
                    onChange={this._onShowWorkItemDetailsChanged}
                    checked={this.props.settingsState.showWorkItemDetails} />

                {progressTrackingCriteriaElement}
                {showClosedSinceDaysElement}

            </div>
        );

        const grid = (
            <div className="feature-timeline-main-container">
                <div className="container" style={gridStyle}>
                    {commandHeading}
                    {columnHeading}
                    {shadows}
                    {workItemShadowCell}
                    {workItemCells}
                    {workItemSeparators}
                    {childDialog}
                </div>
            </div>
        );

        let contents = grid;
        if (!isSubGrid && this.props.planFeaturesState.show) {
            let paneWidth = this.props.planFeaturesState.paneWidth;
            if (paneWidth > 25) {
                paneWidth = 25;
            }
            contents = (
                <SplitterLayout
                    customClassName={"timeline-splitter"}
                    secondaryInitialSize={paneWidth}
                    onSecondaryPaneSizeChange={this._onPaneWidthChanged}
                    percentage={true}
                    primaryMinSize="75"
                >
                    {grid}
                    <ConnectedWorkItemsList />

                </SplitterLayout>
            );
        }

        return (
            <div className="root-container">
                <PromotePortfolioPlans />
                {commands}
                {<div className="header-gap"></div>}
                {contents}
            </div>

        );
    }

    private _onShowPlanFeaturesChanged = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        this.props.togglePlanFeaturesPane(checked);
    }

    private _onShowWorkItemDetailsChanged = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        this.props.toggleShowWorkItemDetails(checked);
    }

    private _onPaneWidthChanged = (width: number) => {
        this.props.resizePlanFeaturesPane(width);
    }

    private _onViewChanged = (text: string) => {
        const {
            projectId,
            teamId,
            gridView: {
                teamIterations,
                currentIterationIndex
            }
        } = this.props;
        const number = +text;
        if (number === 0) {
            this.props.showAllIterations();
        } else {
            this.props.showNIterations(projectId, teamId, number, teamIterations.length, currentIterationIndex);
        }

        return text;
    }

    private _onProgressTrackingCriteriaChanged = (item: { key: string, text: string }) => {
        const {
            changeProgressTrackingCriteria
        } = this.props;
        switch (item.key) {
            case "child":
                changeProgressTrackingCriteria(ProgressTrackingCriteria.ChildWorkItems);
                break;
            case "efforts":
                changeProgressTrackingCriteria(ProgressTrackingCriteria.EffortsField);
                break;
        }
    }

    private _onShowClosedSinceChanged = (item: { key: string, text: string }) => {
        const {
            changeShowClosedSinceDays
        } = this.props;
        changeShowClosedSinceDays(Number(item.key));
    }
}

const ConntectedFeatureTimeline = connect(
    makeMapStateToProps, mapDispatchToProps
)(FeatureTimelineGrid);


export const PrimaryGrid = () => {
    const initialState: IFeatureTimelineRawState = {
        loading: true
    } as IFeatureTimelineRawState;
    const store = configureFeatureTimelineStore(initialState);

    const projectId = getProjectId();
    const teamId = getTeamId();
    const backlogLevel = getBacklogLevel();

    const action = createInitialize(projectId, teamId, backlogLevel);
    store.dispatch(action);

    return (
        <Provider store={store}>
            <ConntectedFeatureTimeline />
        </Provider>);
}

export const DragDropGrid = DragDropContext(HTML5Backend)(PrimaryGrid);