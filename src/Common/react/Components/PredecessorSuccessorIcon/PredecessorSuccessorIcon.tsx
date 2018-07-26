import { css } from '@uifabric/utilities/lib';
import { Link } from 'office-ui-fabric-react/lib/Link';
import * as React from 'react';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import './PredecessorSuccessorIcon.scss';
import { Callout } from 'office-ui-fabric-react/lib/Callout';

export interface IPredecessorSuccessorIconProps {
    workItems: WorkItem[];
    isSuccessor: boolean;
    onClick: (id: number) => void;
}

interface IPredecessorSuccessorIconState {
    isCalloutVisible: boolean;
}

export class PredecessorSuccessorIcon extends React.Component<IPredecessorSuccessorIconProps, IPredecessorSuccessorIconState> {
    private _containerDiv: HTMLDivElement = null;
    public constructor(props, context) {
        super(props, context);
        this.state = {
            isCalloutVisible: false
        }
    }
    public render() {
        const icon = this.props.isSuccessor ? "bowtie-navigate-forward-circle" : "bowtie-navigate-back-circle";
        return (
            <div className={css("bowtie-icon", icon, "successor-predeccessor")} onClick={this._toggleCallout} ref={div => (this._containerDiv = div)}>
                {this._renderPanel()}
            </div>
        );
    }

    private _renderPanel() {
        if (!this.state || !this.state.isCalloutVisible || !this._containerDiv) {
            return null;
        }
        const items = this.props.workItems.map(this._renderWorkItem);
        return (
            <Callout
                className="work-item-links-list-callout"
                target={this._containerDiv}
                isBeakVisible={true}
                onDismiss={this._toggleCallout}
            >
                {items}
            </Callout>
        )
    }

    private _toggleCallout = () => {
        this.setState({
            isCalloutVisible: !this.state.isCalloutVisible
        })
    }

    private _renderWorkItem = (workItem: WorkItem) => {
        return (
            <div className="work-item-link-container">
                <div className="work-item-link-id">{workItem.id}</div>
                <Link className="work-item-link-title" href="#" onClick={() => this.props.onClick(workItem.id)}>{workItem.fields["System.Title"]}</Link>
            </div>
        );
    }
}