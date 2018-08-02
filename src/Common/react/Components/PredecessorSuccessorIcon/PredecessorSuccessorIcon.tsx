import { css } from '@uifabric/utilities/lib';
import * as React from 'react';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import './PredecessorSuccessorIcon.scss';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { SimpleWorkItem } from '../WorkItem/SimpleWorkItem';

export interface IPredecessorSuccessorIconProps {
    id: number;
    workItems: WorkItem[];
    hasSuccessors: boolean;
    isHighlighted: boolean;
    teamFieldName: string;
    onShowWorkItem: (id: number) => void;
    onHighlightDependencies: (id: number, highlightSuccessor: boolean) => void;
    onDismissDependencies: () => void;
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
        const icon = "bowtie-link";
        const highlight = this.props.isHighlighted ? "highlight-icon" : "";

        return (
            <div className={css("bowtie-icon", icon, "successor-predeccessor", highlight)} onClick={this._toggleCallout} ref={div => (this._containerDiv = div)}>
                {this._renderCallout()}
            </div>
        );
    }

    private _renderCallout() {
        if (!this.state || !this.state.isCalloutVisible || !this._containerDiv) {
            return null;
        }
        const filteredItems = this.props.workItems
            .filter(w => !!w);

        const itemsByTeamField = filteredItems.reduce((map, w) => {
            const value = this._getSimpleTeamFieldName(w.fields[this.props.teamFieldName]);
            if (!map[value]) {
                map[value] = [];
            }
            map[value].push(w);
            return map;
        }, {});

        let items = [];
        Object.keys(itemsByTeamField)
            .sort()
            .forEach(teamField => {
                items.push(<div className="team-field-value">{teamField}</div>)
                const workItems = itemsByTeamField[teamField];
                items = items.concat(workItems.map(this._renderWorkItem))
            });

        const label = <Label className="callout-title">{this.props.hasSuccessors ? "Successors" : "Predecessors"}</Label>
        return (
            <Callout
                className="work-item-links-list-callout"
                target={this._containerDiv}
                isBeakVisible={true}
                onDismiss={this._toggleCallout}
            >
                {label}
                {items}
            </Callout>
        )
    }

    private _getSimpleTeamFieldName = (teamField) => {
        teamField = teamField || "";
        const parts = teamField.split("\\");
        return parts[parts.length - 1];
    }

    private _toggleCallout = () => {
        const isCalloutVisible = !this.state.isCalloutVisible;
        if (isCalloutVisible) {
            this.props.onHighlightDependencies(this.props.id, this.props.hasSuccessors);
        } else {
            this.props.onDismissDependencies();
        }
        this.setState({
            isCalloutVisible,
        });
    }

    private _renderWorkItem = (workItem: WorkItem) => {
        return (
            <SimpleWorkItem
                workItem={workItem}
                onShowWorkItem={this.props.onShowWorkItem}
            />
        );
    }
}