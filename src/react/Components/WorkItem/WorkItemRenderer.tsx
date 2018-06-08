import './WorkItemRenderer.scss';
import * as React from 'react';
import { InfoIcon } from '../InfoIcon/InfoIcon';
import { IDimension, CropWorkItem } from '../../../redux/types';
import { getRowColumnStyle } from '../gridhelper';
import {
    TooltipHost, TooltipOverflowMode
} from 'office-ui-fabric-react/lib/Tooltip';
import { css } from '@uifabric/utilities/lib/css';
import { hexToRgb } from '../colorhelper';
import { ProgressDetails } from '../ProgressDetails/ProgressDetails';
import { IProgressIndicator } from '../../../redux/selectors/gridViewSelector';
import { WorkItemStateColor } from 'TFS/WorkItemTracking/Contracts';
import { State } from '../State/State';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ISettingsState, ProgressTrackingCriteria, IIterationDuration, IWorkItemOverrideIteration } from '../../../redux/store/types';
export interface IWorkItemRendererProps {
    id: number;
    title: string;
    workItemStateColor: WorkItemStateColor;
    color: string;
    isRoot: boolean;
    isSubGrid: boolean;
    showInfoIcon: boolean;
    allowOverride: boolean;
    iterationDuration: IIterationDuration;
    dimension: IDimension;
    crop: CropWorkItem;
    progressIndicator: IProgressIndicator;
    settingsState: ISettingsState;
    efforts: number;
    childrernWithNoEfforts: number;
    isComplete: number;

    onClick: (id: number) => void;
    showDetails: (id: number) => void;
    overrideIterationStart: (payload: IWorkItemOverrideIteration) => void;
    overrideIterationEnd: () => void;

    isDragging?: boolean;
    connectDragSource?: (element: JSX.Element) => JSX.Element;
}

export interface IWorkItemRendrerState {
    left: number;
    width: number;
    top: number;
    height: number;
    resizing: boolean;
    isLeft: boolean;
}

export class WorkItemRenderer extends React.Component<IWorkItemRendererProps, IWorkItemRendrerState> {
    private _div: HTMLDivElement;
    private _origPageX: number;
    private _origWidth: number;

    public constructor(props: IWorkItemRendererProps) {
        super(props);
        this.state = {
            resizing: false
        } as IWorkItemRendrerState;
    }

    public render() {
        const {
            id,
            title,
            onClick,
            showDetails,
            isRoot,
            showInfoIcon,
            allowOverride,
            isDragging,
            crop,
            iterationDuration,
            progressIndicator,
            workItemStateColor,
            settingsState,
            childrernWithNoEfforts,
            efforts,
            isSubGrid,
            isComplete
        } = this.props;

        const {
            resizing,
            left,
            top,
            height,
            width
        } = this.state

        let style = {};

        if (!resizing) {
            style = getRowColumnStyle(this.props.dimension);
        } else {
            style['position'] = 'fixed';
            style['left'] = left + "px";
            style['width'] = width + "px";
            style['top'] = top + "px";
            style['height'] = height + "px";
        }

        if (isDragging) {
            style['border-color'] = hexToRgb(this.props.color, 0.1);
        } else if(isComplete){
            style['border-color'] = hexToRgb(this.props.color, 0.3);
        }
        else {
            style['border-color'] = hexToRgb(this.props.color, 0.7);
        }

        const rendererClass = isRoot ? "root-work-item-renderer" : "work-item-renderer";
        let canOverrideLeft = allowOverride;
        let canOverrideRight = allowOverride;
        let leftCropped = false;
        let rightCropped = false;
        switch (crop) {
            case CropWorkItem.Left: {
                canOverrideLeft = false;
                leftCropped = true;
                break;
            }
            case CropWorkItem.Right: {
                canOverrideRight = false;
                rightCropped = true;
                break;
            }
            case CropWorkItem.Both: {
                canOverrideLeft = false;
                canOverrideRight = false;
                leftCropped = true;
                rightCropped = true;
                break;
            }
        }

        const infoIcon = showInfoIcon ? <InfoIcon id={id} onClick={id => showDetails(id)} /> : null;
        const additionalDetailsContainer = infoIcon ? "work-item-details-with-infoicon" : "work-item-details-without-infoicon";

        let leftHandle = null;
        let rightHandle = null;

        if (!isRoot && allowOverride) {
            leftHandle = canOverrideLeft && (
                <div
                    className="work-item-iteration-override-handle"
                    onMouseDown={this._leftMouseDown}
                    onMouseUp={this._mouseUp}
                />
            );

            rightHandle = canOverrideRight && (
                <div
                    className="work-item-iteration-override-handle"
                    onMouseDown={this._rightMouseDown}
                    onMouseUp={this._mouseUp}
                />
            );
        }

        let startsFrom = <div />;
        if (leftCropped) {
            startsFrom = (
                <TooltipHost
                    content={`Starts at ${iterationDuration.startIteration.name}`}>
                    <div className="work-item-start-iteration-indicator">{`${iterationDuration.startIteration.name}`}</div>
                </TooltipHost>
            );
        }

        let endsAt = <div />;
        if (rightCropped) {
            endsAt = (
                <TooltipHost
                    content={`Ends at ${iterationDuration.endIteration.name}`}>
                    <div className="work-item-end-iteration-indicator">{`${iterationDuration.endIteration.name}`}</div>
                </TooltipHost>
            );
        }

        let secondRow = null;

        if (settingsState.showWorkItemDetails) {
            let stateIndicator = null;

            if (workItemStateColor && !isRoot) {
                stateIndicator = <State workItemStateColor={workItemStateColor} />;
            }

            let warning = null;
            let warningMessages = [];
            if (iterationDuration.childrenAreOutofBounds) {
                warningMessages.push("Some user stories for this feature are outside the bounds of start or end iteration of this feature.");
            }

            if (settingsState.progressTrackingCriteria === ProgressTrackingCriteria.EffortsField && childrernWithNoEfforts > 0) {
                warningMessages.push("Some user stories for this feature do not have story points set.");
            }

            if (isSubGrid && efforts === 0 && settingsState.progressTrackingCriteria === ProgressTrackingCriteria.EffortsField) {
                warningMessages.push("Story points are not set.")
            }

            if (warningMessages.length > 0 && !isRoot) {
                const content = warningMessages.join(",");
                warning = (
                    <TooltipHost
                        content={content}>
                        <Icon
                            iconName={'Warning'}
                            className="work-item-warning"
                            onClick={() => {
                                if (!isSubGrid) 
                                { 
                                    showDetails(id); 
                                } else {
                                    onClick(id);
                                }
                            }
                            }
                        />
                    </TooltipHost >
                );

            }
            let progressDetails = null;
            if (progressIndicator && !isRoot) {
                progressDetails = (
                    <ProgressDetails
                        {...progressIndicator}
                        onClick={() => showDetails(id)}
                    />);
            }

            secondRow = (
                <div className="work-item-detail-row secondary-row">
                    {stateIndicator}
                    {progressDetails}
                    {warning}
                </div>
            );
        }

        const item = (
            <div
                className={rendererClass}
                style={style}
                ref={(e) => this._div = e}
            >
                {leftHandle}
                <div className="work-item-detail-rows">
                    <div className="work-item-detail-row">
                        <div
                            className={css("work-item-details-container", additionalDetailsContainer)}
                        >
                            {startsFrom}
                            <div
                                className="title-contents"
                                onClick={() => onClick(id)}
                            >
                                <TooltipHost
                                    content={title}
                                    overflowMode={TooltipOverflowMode.Parent}
                                >
                                    {title}
                                </TooltipHost>
                            </div>
                            {endsAt}
                        </div>
                        {infoIcon}
                    </div>
                    {secondRow}
                </div>
                {rightHandle}
            </div>
        );

        if (isRoot) {
            return item;
        }
        const { connectDragSource } = this.props;

        return connectDragSource(item);
    }

    private _leftMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        this._resizeStart(e, true);
    }

    private _rightMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        this._resizeStart(e, false);
    }

    private _mouseUp = () => {
        window.removeEventListener("mousemove", this._mouseMove);
        window.removeEventListener("mouseup", this._mouseUp);
        this.setState({
            resizing: false
        });

        this.props.overrideIterationEnd();
    }

    private _resizeStart(e: React.MouseEvent<HTMLDivElement>, isLeft: boolean) {
        e.preventDefault();
        const rect = this._div.getBoundingClientRect() as ClientRect;
        this._origPageX = e.pageX;
        this._origWidth = rect.width;

        this.props.overrideIterationStart({
            workItemId: this.props.id,
            iterationDuration: {
                startIterationId: this.props.iterationDuration.startIteration.id,
                endIterationId: this.props.iterationDuration.endIteration.id,
                user: VSS.getWebContext().user.uniqueName
            },
            changingStart: isLeft
        });

        window.addEventListener("mousemove", this._mouseMove);
        window.addEventListener("mouseup", this._mouseUp);

        this.setState({
            left: rect.left,
            width: rect.width,
            top: rect.top - 10, //The rect.top does not contain margin-top
            height: rect.height,
            resizing: true,
            isLeft: isLeft
        });
    }

    private _mouseMove = (ev: MouseEvent) => {
        ev.preventDefault();
        const newPageX = ev.pageX;
        if (this.state.isLeft) {
            let width = 0;
            // moved mouse left we need to increase the width
            if (newPageX < this._origPageX) {
                width = this._origWidth + (this._origPageX - newPageX);
            } else {
                // moved mouse right we need to decrease the width
                width = this._origWidth - (newPageX - this._origPageX);
            }

            if (width > 100) {
                this.setState({
                    left: ev.clientX,
                    width: width
                });
            }
        } else {
            let width = 0;
            // movd left we need to decrease the width
            if (newPageX < this._origPageX) {
                width = this._origWidth - (this._origPageX - newPageX);
            } else {
                // We need to increase the width
                width = this._origWidth + (newPageX - this._origPageX);
            }

            if (width > 100) {
                this.setState({
                    width: width
                });
            }
        }
    }
}


