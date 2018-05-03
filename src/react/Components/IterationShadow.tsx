import './IterationShadow.scss';

import * as React from 'react';
import { IGridIteration } from '../../redux/selectors/gridViewSelector';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { getRowColumnStyle } from './gridhelper';

export interface IIterationSahdowProps extends IGridIteration {
    isOverrideIterationInProgress: boolean;
    onOverrideIterationOver: (iteration: string) => void;
    changeIteration: (id: number, teamIteration: TeamSettingsIteration, override: boolean) => void;

    connectDropTarget?: (element: JSX.Element) => JSX.Element;
    isOver?: boolean;
    canDrop?: () => boolean;
}

export interface IIterationSahdowState {
    shouldHighlight: boolean;
}

export class IterationShadow extends React.Component<IIterationSahdowProps, IIterationSahdowState> {

    private _div: HTMLDivElement;

    public constructor(props) {
        super(props);

        this.state = {
            shouldHighlight: false
        };
    }


    public render() {
        const className = "columnshadow" + (this.state.shouldHighlight || this.props.isOver ? " highlight" : "");
        const style = getRowColumnStyle(this.props.dimension);
        const { connectDropTarget } = this.props;

        return connectDropTarget(
            <div
                className={className}
                ref={(e) => this._div = e}
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
        if (this.props.isOverrideIterationInProgress) {
            this.setState({
                shouldHighlight: true
            });

            this.props.onOverrideIterationOver(this.props.teamIteration.id);
        }
    }

    private _onMouseLeave = () => {
        if (this.props.isOverrideIterationInProgress)
            this.setState({
                shouldHighlight: false
            })
    }
}
