import { Link } from "office-ui-fabric-react/lib/Link";
import * as React from "react";
import { WorkItem } from "TFS/WorkItemTracking/Contracts";
import "./SimpleWorkItem.scss";

export interface ISimpleWorkItemProps {
    workItem: WorkItem;
    onShowWorkItem: (id: number) => void;
}

export class SimpleWorkItem extends React.Component<ISimpleWorkItemProps, {}>{
    public render() {
        const {
            workItem
        } = this.props;

        return (
            <div className="work-item-link-container">
                <div className="work-item-link-id">{workItem.id}</div>
                <Link className="work-item-link-title" href="#" onClick={() => this.props.onShowWorkItem(workItem.id)}>{workItem.fields["System.Title"]}</Link>
            </div>
        );
    }
}