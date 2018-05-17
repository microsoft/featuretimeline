import './WorkItemRenderer.scss';
import * as React from 'react';
import { InfoIcon } from '../InfoIcon/InfoIcon';
import { IIterationDuration, IWorkItemOverrideIteration } from '../../../redux/store';
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
export interface IWorkItemRendererProps {
    id: number;
    title: string;
    workItemStateColor: WorkItemStateColor;
    color: string;
    isRoot: boolean;
    shouldShowDetails: boolean;
    allowOverride: boolean;
    iterationDuration: IIterationDuration;
    dimension: IDimension;
    crop: CropWorkItem;
    progressIndicator: IProgressIndicator;

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
            shouldShowDetails,
            allowOverride,
            isDragging,
            crop,
            iterationDuration,
            progressIndicator,
            workItemStateColor
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
            style['background'] = hexToRgb(this.props.color, 0.1);
        } else {
            style['background'] = hexToRgb(this.props.color, 0.7);
        }

        const workItemClassName = isRoot ? "root-work-item-renderer" : "work-item-renderer";
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

        const infoIcon = shouldShowDetails ? <InfoIcon id={id} onClick={id => showDetails(id)} /> : null;
        const additionalTitleClass = infoIcon ? "title-with-infoicon" : "title-without-infoicon";

        let leftHandle = null;
        let rightHandle = null;

        if (!isRoot && allowOverride) {
            leftHandle = canOverrideLeft && (
                <div
                    className="small-border"
                    onMouseDown={this._leftMouseDown}
                    onMouseUp={this._mouseUp}
                />
            );

            rightHandle = canOverrideRight && (
                <div
                    className="small-border"
                    onMouseDown={this._rightMouseDown}
                    onMouseUp={this._mouseUp}
                />
            );
        }

        let startsFrom = <div />;
        if (leftCropped) {
            startsFrom = (<TooltipHost
                content={`Starts at ${iterationDuration.startIteration.name}`}>
                <div className="work-item-start-iteration-indicator">{`${iterationDuration.startIteration.name}`}</div>
            </TooltipHost>
            );
        }

        let endsAt = <div />;
        if (rightCropped) {
            endsAt = (<TooltipHost
                content={`Ends at ${iterationDuration.endIteration.name}`}>
                <div className="work-item-end-iteration-indicator">{`${iterationDuration.endIteration.name}`}</div>
            </TooltipHost>
            );
        }

        debugger;
        let stateIndicator = null;
        if (workItemStateColor && !isRoot) {
            const stateColorStyle = {};
            const color = "#" + (workItemStateColor.color.length > 6 ? workItemStateColor.color.substr(2) : workItemStateColor.color)
            stateColorStyle['background'] = color;
            stateIndicator = (
                <TooltipHost content={workItemStateColor.name}>
                    <div className="state-indicator" style={stateColorStyle} />
                </TooltipHost>
            )
        }

        const item = (
            <div
                className={workItemClassName}
                style={style}
                ref={(e) => this._div = e}
            >
                <div className={"work-item"}>
                    {leftHandle}
                    <div
                        className={css("work-item-details-container", additionalTitleClass)}
                    >
                        {stateIndicator}

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
                    {rightHandle}
                </div>
                {
                    progressIndicator && 
                    !isRoot &&
                    (<ProgressDetails
                        {...progressIndicator}
                        onClick={() => showDetails(id)}
                    />
                    )
                }
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


