import { DragSource } from 'react-dnd';
import * as React from 'react';
import { IWorkItemListItemProps, WorkItemListItem } from './WorkItemListItem';

class DraggableHelper extends React.Component<IWorkItemListItemProps, {}> {
    public render() {
        return <WorkItemListItem {...this.props} />;
    }

}

const WorkItemSource = {
    beginDrag(props: IWorkItemListItemProps) {
        return props;
    }
}

/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

export default DragSource("WorkItem", WorkItemSource, collect)(DraggableHelper);