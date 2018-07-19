import './State.scss';
import * as React from 'react';
import { WorkItemStateColor } from 'TFS/WorkItemTracking/Contracts';

export interface IStateProps {
    workItemStateColor: WorkItemStateColor;
}

export class State extends React.Component<IStateProps, {}> {
    public render() {
        const {
            workItemStateColor
        } = this.props;

        const stateColorStyle = {};
        const color = "#" + (workItemStateColor.color.length > 6 ? workItemStateColor.color.substr(2) : workItemStateColor.color)
        stateColorStyle['background'] = color;

        return (
            <div className="state-container">
                <div className="state-indicator" style={stateColorStyle} />
                <div className="state-name">{workItemStateColor.name}</div>
            </div>
        )
    }

}