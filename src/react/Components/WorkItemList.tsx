import * as React from 'react';
import { connect } from 'react-redux';
import { IFeatureTimelineRawState } from '../../redux/store';
import { planFeaturesSelector } from '../../redux/selectors';
import { launchWorkItemForm } from '../../redux/store/workitems/actionCreators';
import { List } from 'office-ui-fabric-react/lib/List';
import DraggableWorkItemListItemRenderer from './WorkItem/DraggableWorkItemListItemRenderer';
import { MessageBar } from 'office-ui-fabric-react/lib/MessageBar';

export interface IWorkItemListItem {
    id: number;
    title: string;
    color: string;
    inProgressState: string;
}

export interface IWorkItemListProps {
    workItems: IWorkItemListItem[];
    launchWorkItemForm: (id: number) => void;
}

export interface IWorkItemListState {
}

class WorkItemList extends React.Component<IWorkItemListProps, IWorkItemListState> {
    public render() {
        if (this.props.workItems.length === 0) {
            return (
                <MessageBar>No Proposed Features</MessageBar>
            );
        }
        return (
            <div className="work-item-list-container">
                <List
                    items={this.props.workItems}
                    onRenderCell={this._onRenderCell}
                />
            </div>
        );
    }

    private _onRenderCell = (item: IWorkItemListItem, index: number) => {
        return (
            <DraggableWorkItemListItemRenderer {...item} onClick={this.props.launchWorkItemForm} />
        );
    }
}

const makeMapStateToProps = () => {
    return (state: IFeatureTimelineRawState) => {
        return {
            workItems: planFeaturesSelector()(state)
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        launchWorkItemForm: (id: number) => {
            if (id) {
                dispatch(launchWorkItemForm(id));
            }
        },

    };
};
export const ConnectedWorkItemsList = connect(
    makeMapStateToProps, mapDispatchToProps
)(WorkItemList);
