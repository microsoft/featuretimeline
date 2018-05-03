import { DragSource } from 'react-dnd';
import { IWorkItemRendererProps, WorkItemRenderer } from './WorkItemRenderer';
import * as React from 'react';

class DraggableHelper extends React.Component<IWorkItemRendererProps, {}> {
    public render() {
        return <WorkItemRenderer {...this.props} />;
    }

}

const WorkItemSource = {
    beginDrag(props: IWorkItemRendererProps) {
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