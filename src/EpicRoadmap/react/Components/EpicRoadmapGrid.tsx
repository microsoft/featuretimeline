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
import { TeamFieldCard } from '../../../Common/react/Components/TeamField/TeamFieldCard';
import { TeamFieldHeader } from '../../../Common/react/Components/TeamFieldHeader/TeamFieldHeader';
import { ChildRowsSeparator } from '../../../Common/react/Components/WorkItem/ChildRowsSeparatorGap';
import { DraggableWorkItemRenderer } from '../../../Common/react/Components/WorkItem/DraggableWorkItemRenderer';
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
import { IEpicRoadmapState } from '../../redux/contracts';
import { EpicRoadmapGridViewSelector, IEpicRoadmapGridView } from '../../redux/selectors/EpicRoadmapGridViewSelector';
import './EpicRoadmapGrid.scss';
import { RoadmapTimelineDialog } from './RoadmapTimelineDialog/RoadmapTimelineDialog';
import { HighlightDependenciesActionsCreator } from '../../../Common/redux/modules/HighlightDependencies/HighlightDependenciesModule';
import { IWorkItemRendererProps } from '../../../Common/react/Components/WorkItem/WorkItemRenderer';

export interface IEpicRoadmapGridContentProps {
    projectId: string;
    teamId: string;
    gridView: IEpicRoadmapGridView;
    rawState: IEpicRoadmapState,
    isSubGrid: boolean,
    teamFieldName: string,

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
    onHighlightDependencies: (id: number, hightlightSuccessor: boolean) => void;
    onDismissDependencies: () => void;
}

export class EpicRoadmapGridContent extends React.Component<IEpicRoadmapGridContentProps, {}> {

    public render(): JSX.Element {
        const {
            rawState,
            gridView: {
                emptyHeaderRow,
                iterationHeader,
                iterationShadow,
                workItems,
                separators,
                shadowForWorkItemId,
                iterationDisplayOptions,
                teamIterations,
                teamFieldDisplayItems,
                teamFieldHeaderItem
            },
            isSubGrid
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
        if (shadowForWorkItemId > 0) {
            const workItem = workItems.filter(w => w.workItem.id === shadowForWorkItemId)[0];
            workItemShadowCell = (
                <WorkItemShadow dimension={workItem.dimension} twoRows={workItem.settingsState.showWorkItemDetails} />
            );
        }

        const teamFieldCards = teamFieldDisplayItems.map(tfdi => <TeamFieldCard dimension={tfdi.dimension} teamField={tfdi.teamField} />);

        const workItemCells = workItems.filter(w => w.workItem.id).map(w => {
            const props: IWorkItemRendererProps = {
                id: w.workItem.id,
                title: w.workItem.title,
                color: w.workItem.color,
                isRoot: w.workItem.isRoot,
                iterationDuration: w.workItem.iterationDuration,
                dimension: w.dimension,
                onClick: this.props.launchWorkItemForm,
                showInfoIcon: w.workItem.showInfoIcon,
                showDetails: this.props.showDetails,
                overrideIterationStart: this.props.overrideIterationStart,
                overrideIterationEnd: this.props.overrideIterationEnd,
                allowOverrideIteration: w.allowOverrideIteration,
                isSubGrid: isSubGrid,
                progressIndicator: w.progressIndicator,
                crop: w.crop,
                workItemStateColor: w.workItem.workItemStateColor,
                settingsState: w.settingsState,
                efforts: w.workItem.efforts,
                childrernWithNoEfforts: w.workItem.childrenWithNoEfforts,
                isComplete: w.workItem.isComplete,
                successors: w.workItem.successors,
                predecessors: w.workItem.predecessors,
                highlightPredecessorIcon: w.workItem.highlightPredecessorIcon,
                highlighteSuccessorIcon: w.workItem.highlighteSuccessorIcon,
                onHighlightDependencies: this.props.onHighlightDependencies,
                onDismissDependencies: this.props.onDismissDependencies,
                teamFieldName: this.props.teamFieldName
            }
            return (
                <DraggableWorkItemRenderer
                    {...props}
                />
            );
        });

        const childRowsSeparator = separators.map(d => {
            return (
                <ChildRowsSeparator {...d} />
            );
        });


        const extraColumns = this.props.gridView.hideParents ? [] : ['200px'];
        let min = '200px';
        if (isSubGrid) {
            min = '150px';
        }
        const gridStyle = getTemplateColumns(extraColumns, shadows.length, `minmax(${min}, 300px)`);

        let childDialog = null;
        if (!this.props.isSubGrid && this.props.rawState.workItemsToShowInfoFor.length > 0) {
            childDialog = (
                <RoadmapTimelineDialog
                    {...this.props}
                    isSubGrid={true}
                />
            );
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
        if (!isSubGrid && showWorkItemDetails) {
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

        const teamFieldHeader = <TeamFieldHeader dimension={teamFieldHeaderItem} />

        const grid = (
            <div className="feature-timeline-main-container">
                <div className="container" style={gridStyle}>
                    {commandHeading}
                    {teamFieldHeader}
                    {columnHeading}
                    {shadows}
                    {workItemShadowCell}
                    {workItemCells}
                    {childRowsSeparator}
                    {teamFieldCards}
                    {childDialog}
                </div>
            </div>
        );

        return (
            <div className="root-container" >
                {commands}
                {<div className="header-gap" ></div>}
                {grid}
            </div >

        );

    }

    private _onShowWorkItemDetailsChanged = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        this.props.toggleShowWorkItemDetails(checked);
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
}

const makeMapStateToProps = () => {
    return (state: IEpicRoadmapState) => {
        return {
            projectId: getProjectId(),
            teamId: getTeamId(),
            gridView: EpicRoadmapGridViewSelector(/* isSubGrid */false, /* rootWorkItemId */ state.settingsState.lastEpicSelected)(state), //TODO: This need to come from another selector which is populated by the dropdown
            rawState: state,
            isSubGrid: false,
            teamFieldName: state.backlogConfigurations[getProjectId()].backlogFields.typeFields["Team"]
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
        },
        onHighlightDependencies: (id: number, highlightSuccessor: boolean) => {
            dispatch(HighlightDependenciesActionsCreator.highlightDependencies(id, highlightSuccessor));
        },
        onDismissDependencies: () => {
            dispatch(HighlightDependenciesActionsCreator.dismissDependencies());
        }
    };
};

export const EpicRoadmapGrid = DragDropContext(HTML5Backend)(connect(makeMapStateToProps, mapDispatchToProps)(EpicRoadmapGridContent));