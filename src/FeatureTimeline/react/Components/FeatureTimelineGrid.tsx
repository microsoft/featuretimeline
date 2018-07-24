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
import { launchWorkItemForm } from "../../../Common/actions/launchWorkItemForm";
import { IGridView } from '../../../Common/Contracts/GridViewContracts';
import { ISettingsState, ProgressTrackingCriteria } from "../../../Common/Contracts/OptionsInterfaces";
import { UIStatus } from '../../../Common/Contracts/types';
import { getRowColumnStyle, getTemplateColumns } from '../../../Common/Helpers/gridhelper';
import { changeDisplayIterationCount, displayAllIterations, shiftDisplayIterationLeft, shiftDisplayIterationRight } from '../../../Common/modules/IterationDisplayOptions/IterationDisplayOptionsActions';
import { endOverrideIteration, overrideHoverOverIteration, startOverrideIteration } from '../../../Common/modules/overrideIterationProgress/actionCreators';
import { IWorkItemOverrideIteration } from '../../../Common/modules/OverrideIterations/overriddenIterationContracts';
import { OverriddenIterationsActionCreator } from '../../../Common/modules/OverrideIterations/overrideIterationsActions';
import { getProjectId, getTeamId } from '../../../Common/Selectors/CommonSelectors';
import configureFeatureTimelineStore from '../../redux/configureStore';
import { getBacklogLevel, getRawState, planFeatureStateSelector, primaryGridViewSelector, settingsStateSelector, uiStatusSelector } from '../../redux/selectors';
import { changePlanFeaturesWidth, changeProgressTrackingCriteria, changeShowClosedSinceDays, closeDetails, createInitialize, showDetails, togglePlanFeaturesPane, toggleShowWorkItemDetails } from '../../redux/store/common/actioncreators';
import { IFeatureTimelineRawState, IPlanFeaturesState } from '../../redux/store/types';
import { startMarkInProgress, startUpdateWorkItemIteration } from '../../redux/store/workitems/actionCreators';
import { IterationDropTarget } from './DroppableIterationShadow';
import './FeatureTimelineGrid.scss';
import { IterationRenderer } from './IterationRenderer';
import { TimelineDialog } from './TimelineDialog';
import DraggableWorkItemRenderer from './WorkItem/DraggableWorkItemRenderer';
import { WorkitemGap } from './WorkItem/WorkItemGap';
import { WorkItemShadow } from './WorkItem/WorkItemShadow';
import { ConnectedWorkItemsList } from './WorkItemList';


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
    overrideIterationEnd: () => void;
    changeIteration: (id: number, teamIteration: TeamSettingsIteration, override: boolean) => void;
    showNIterations: (projectId: string, teamId: string, count: Number) => void;
    shiftDisplayIterationLeft: () => void;
    shiftDisplayIterationRight: () => void;
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
            childItems: state.workItemDetails,
            planFeaturesState: planFeatureStateSelector()(state),
            settingsState: settingsStateSelector()(state)
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
        showNIterations: (projectId: string, teamId: string, count: Number) => {
            dispatch(changeDisplayIterationCount(count, projectId, teamId));
        },
        showAllIterations: () => {
            dispatch(displayAllIterations());
        },
        shiftDisplayIterationLeft: () => {
            dispatch(shiftDisplayIterationLeft(1));
        },
        shiftDisplayIterationRight: () => {
            dispatch(shiftDisplayIterationRight(1));
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
                <Spinner size={SpinnerSize.large} label="Loading..." />
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
            const workItem = workItems.filter(w => !w.isGap && w.workItem.id === shadowForWorkItemId)[0];
            workItemShadowCell = (
                <WorkItemShadow dimension={workItem.dimension} twoRows={workItem.settingsState.showWorkItemDetails} />
            );
        }

        const workItemCells = workItems.filter(w => !w.isGap && w.workItem.id).map(w => {
            return (
                <DraggableWorkItemRenderer
                    id={w.workItem.id}
                    title={w.workItem.title}
                    color={w.workItem.color}
                    isRoot={w.workItem.isRoot}
                    iterationDuration={w.workItem.iterationDuration}
                    dimension={w.dimension}
                    onClick={id => this.props.launchWorkItemForm(id)}
                    showInfoIcon={w.workItem.showInfoIcon}
                    showDetails={id => this.props.showDetails(id)}
                    overrideIterationStart={payload => this.props.overrideIterationStart(payload)}
                    overrideIterationEnd={() => this.props.overrideIterationEnd()}
                    allowOverride={!this.props.gridView.isSubGrid}
                    isSubGrid={this.props.gridView.isSubGrid}
                    progressIndicator={w.progressIndicator}
                    crop={w.crop}
                    workItemStateColor={w.workItem.workItemStateColor}
                    settingsState={w.settingsState}
                    efforts={w.workItem.efforts}
                    childrernWithNoEfforts={w.workItem.childrenWithNoEfforts}
                    isComplete={w.workItem.isComplete}
                />
            );
        });

        const workItemGaps = workItems.filter(w => w.isGap).map(w => {
            return (
                <WorkitemGap {...w.dimension} />
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
            childDialog = <TimelineDialog {...props} />
        }

        let leftButton = <span className="non-button"></span>;
        if (iterationDisplayOptions && iterationDisplayOptions.startIndex > 0) {
            leftButton = (
                <IconButton
                    className="button"
                    onClick={() => this.props.shiftDisplayIterationLeft()}
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
                    onClick={() => this.props.shiftDisplayIterationRight()}
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
                    {workItemGaps}
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
            teamId
        } = this.props;
        const number = +text;
        if (number === 0) {
            this.props.showAllIterations();
        } else {
            this.props.showNIterations(projectId, teamId, number);
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