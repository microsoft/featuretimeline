import './IterationShadow.scss';

import * as React from 'react';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { getRowColumnStyle } from '../../redux/Helpers/gridhelper';
import { IGridIteration } from '../../redux/Contracts/GridViewContracts';

export interface IIterationSahdowProps extends IGridIteration {
    isOverrideIterationInProgress: boolean;
    onOverrideIterationOver: (iteration: string) => void;
    changeIteration: (id: number, teamIteration: TeamSettingsIteration, override: boolean) => void;
    markInProgress: (id: number, teamIteration: TeamSettingsIteration, state: string) => void;

    connectDropTarget?: (element: JSX.Element) => JSX.Element;
    isOver?: boolean;
    canDrop?: () => boolean;
}

export interface IIterationSahdowState {
    shouldHighlight: boolean;
}

export class IterationShadow extends React.Component<IIterationSahdowProps, IIterationSahdowState> {

    private _div: HTMLDivElement;
    private _clientRect: ClientRect;
    private _listnerAdded: boolean;

    public constructor(props) {
        super(props);

        this.state = {
            shouldHighlight: false
        };
    }

    private _setRef = (e: HTMLDivElement) => {
        if(this._div) {
            // do nothing
        }        
        if (e) {
            this._div = e;
            this._clientRect = e.getBoundingClientRect();
            if (!this._listnerAdded) {
                this._listnerAdded = true;
                document.addEventListener("mousemove", this._MouseMove, { capture: true });
            }
        }
    }


    private _MouseMove = (mouseEvent: MouseEvent): any => {
        if (this.state.shouldHighlight && !this.props.isOverrideIterationInProgress) {
            this._onMouseLeave();
        }
        if (this.props.isOverrideIterationInProgress) {
            const {
                left,
                width
            } = this._clientRect;
            if (mouseEvent.clientX >= left && mouseEvent.clientX <= (left + width)) {
                this._onMouseEnter();
            } else {
                this._onMouseLeave();
            }
        }
    }

    public componentWillUnmount() {
        window.removeEventListener("mousemove", this._MouseMove);
    }

    public render() {
        const className = "columnshadow" + (this.state.shouldHighlight || this.props.isOver ? " highlight" : "");
        const style = getRowColumnStyle(this.props.dimension);
        const { connectDropTarget } = this.props;

        return connectDropTarget(
            <div
                className={className}
                ref={this._setRef}
                onMouseMove={this._onMouseEnter}
                onDragOver={this._onMouseEnter}
                onMouseLeave={this._onMouseLeave}
                style={style}
            >
                {this.props.children}
            </div>
        );
    }

    private _onMouseEnter = () => {
        if (this.props.isOverrideIterationInProgress && !this.state.shouldHighlight) {
            this.setState({
                shouldHighlight: true
            });

            this.props.onOverrideIterationOver(this.props.teamIteration.id);
        }
    }

    private _onMouseLeave = () => {
        if (this.state.shouldHighlight)
            this.setState({
                shouldHighlight: false
            })
    }
}
