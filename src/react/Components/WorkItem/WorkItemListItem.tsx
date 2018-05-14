import * as React from 'react';
import { TooltipHost, TooltipOverflowMode } from 'office-ui-fabric-react/lib/Tooltip';
import { hexToRgb } from '../colorhelper';

export interface IWorkItemListItemProps {
    id: number;
    title: string;
    color: string;
    inProgressState: string;
    onClick: (id: number) => void;

    isDragging?: boolean;
    connectDragSource?: (element: JSX.Element) => JSX.Element;
}

export class WorkItemListItem extends React.Component<IWorkItemListItemProps, {}> {
    public render() {
        const {
            id,
            title,
            onClick,
            isDragging,
        } = this.props;

        let style = {};

        if (isDragging) {
            style['background'] = hexToRgb(this.props.color, 0.1);
        } else {
            style['background'] = hexToRgb(this.props.color, 0.8);
        }

        const className = "work-item-list-item";

        const item = (
            <div style={style}
                className={className}
            >
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
            </div>
        );

        const { connectDragSource } = this.props;

        return connectDragSource(item);
    }
}