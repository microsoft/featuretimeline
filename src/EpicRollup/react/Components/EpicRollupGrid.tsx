import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { ComboBox } from 'office-ui-fabric-react/lib/ComboBox';
import InputNum from "rc-input-number";
import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { IterationDropTarget } from '../../../Common/react/Components/DroppableIterationShadow';
import { IterationRenderer } from '../../../Common/react/Components/IterationRenderer';
import DraggableWorkItemRenderer from '../../../Common/react/Components/WorkItem/DraggableWorkItemRenderer';
import { WorkitemGap } from '../../../Common/react/Components/WorkItem/WorkItemGap';
import { WorkItemShadow } from '../../../Common/react/Components/WorkItem/WorkItemShadow';
import { launchWorkItemForm } from '../../../Common/redux/actions/launchWorkItemForm';
import { startUpdateWorkItemIteration } from '../../../Common/redux/actions/StartUpdateWorkitemIterationAction';
import { getRowColumnStyle, getTemplateColumns } from '../../../Common/redux/Helpers/gridhelper';
import { changeDisplayIterationCount, displayAllIterations, shiftDisplayIterationLeft, shiftDisplayIterationRight } from '../../../Common/redux/modules/IterationDisplayOptions/IterationDisplayOptionsActions';
import { endOverrideIteration, overrideHoverOverIteration, startOverrideIteration } from '../../../Common/redux/modules/overrideIterationProgress/overrideIterationProgressActionCreators';
import { IWorkItemOverrideIteration } from '../../../Common/redux/modules/OverrideIterations/overriddenIterationContracts';
import { OverriddenIterationsActionCreator } from '../../../Common/redux/modules/OverrideIterations/overrideIterationsActions';
import { changeProgressTrackingCriteria, toggleShowWorkItemDetails } from '../../../Common/redux/modules/SettingsState/SettingsStateActions';
import { ProgressTrackingCriteria } from '../../../Common/redux/modules/SettingsState/SettingsStateContracts';
import { closeDetails, showDetails } from '../../../Common/redux/modules/ShowHideDetails/ShowHideDetailsActions';
import { getProjectId, getTeamId } from '../../../Common/redux/Selectors/CommonSelectors';
import { IEpicRollupState } from '../../redux/contracts';
import { epicRollupGridViewSelector, IEpicRollupGridView } from '../../redux/selectors/epicRollupGridViewSelector';
import './EpicRollupGrid.scss';

export interface IEpicRollupGridProps {
    projectId: string;
    teamId: string;
    gridView: IEpicRollupGridView;
    rawState: IEpicRollupState,

    launchWorkItemForm: (id: number) => void;
    showDetails: (id: number) => void;
    closeDetails: (id: number) => void;
    clearOverrideIteration: (id: number) => void;
    dragHoverOverIteration: (iteration: string) => void;
    overrideIterationStart: (payload: IWorkItemOverrideIteration) => void;
    overrideIterationEnd: () => void;
    changeIteration: (id: number, teamIteration: TeamSettingsIteration, override: boolean) => void;
    showNIterations: (projectId: string, teamId: string, count: Number, maxIterations: number, currentIterationIndex: number) => void;
    shiftDisplayIterationLeft: (maxIterations: number) => void;
    shiftDisplayIterationRight: (maxIterations: number) => void;
    showAllIterations: () => void;
    markInProgress: (id: number, teamIteration: TeamSettingsIteration) => void;
    toggleShowWorkItemDetails: (show: boolean) => void;
    changeProgressTrackingCriteria: (criteria: ProgressTrackingCriteria) => void;
}

export class EpicRollupGridContent extends React.Component<IEpicRollupGridProps, {}> {

    public render(): JSX.Element {
        const {
            rawState,
            gridView: {
                emptyHeaderRow,
                iterationHeader,
                iterationShadow,
                workItems,
                shadowForWorkItemId,
                iterationDisplayOptions,
                isSubGrid,
                teamIterations
            }
        } = this.props;

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
        debugger;
        if (shadowForWorkItemId > 0) {
            const workItem = workItems.filter(w => !w.isGap && w.workItem.id === shadowForWorkItemId)[0];
            workItemShadowCell = (
                <WorkItemShadow dimension={workItem.dimension} twoRows={workItem.settingsState.showWorkItemDetails} />
            );
        }

        debugger;
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
        if (this.props.rawState.workItemsToShowInfoFor.length > 0) {
            //const props = { ...this.props, id: this.props.rawState.workItemsToShowInfoFor[0] };
            childDialog = <div>{`Showing infor for ${this.props.rawState.workItemsToShowInfoFor[0]} `}</div>;//<TimelineDialog {...props} />
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
            progressTrackingCriteria
        } = this.props.rawState.settingsState;
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

        const commands = !isSubGrid && (
            <div className="header-commands">
                {displayOptions}

                <Checkbox
                    className="show-work-item-details-checkbox"
                    label={"Show Details"}
                    onChange={this._onShowWorkItemDetailsChanged}
                    checked={this.props.rawState.settingsState.showWorkItemDetails} />

                {progressTrackingCriteriaElement}
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

        return (
            <div className="root-container">
                {commands}
                {<div className="header-gap"></div>}
                {grid}
            </div>

        );

    }

    private _onShowWorkItemDetailsChanged = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        this.props.toggleShowWorkItemDetails(checked);
    }

    private _onViewChanged = (text: string) => {
        const {
            projectId,
            teamId,
            gridView:{
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
}

const makeMapStateToProps = () => {
    return (state: IEpicRollupState) => {
        return {
            projectId: getProjectId(),
            teamId: getTeamId(),
            gridView: epicRollupGridViewSelector(state),
            rawState: state
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
            //dispatch(startMarkInProgress(id, teamIteration, state));
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
        toggleShowWorkItemDetails: (show: boolean) => {
            dispatch(toggleShowWorkItemDetails(show));
        },
        changeProgressTrackingCriteria: (criteria: ProgressTrackingCriteria) => {
            dispatch(changeProgressTrackingCriteria(criteria));
        }
    };
};

export const EpicRollupGrid = DragDropContext(HTML5Backend)(connect(makeMapStateToProps, mapDispatchToProps)(EpicRollupGridContent));