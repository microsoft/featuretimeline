import * as React from 'react';
import { connect } from 'react-redux';
import { IFeatureTimelineRawState } from '../../../FeatureTimeline/redux/store/types';
import { unplannedFeaturesSelector, planFeatureStateSelector } from '../../../FeatureTimeline/redux/selectors';
import { launchWorkItemForm } from "../../redux/actions/launchWorkItemForm";
import { List } from 'office-ui-fabric-react/lib/List';
import DraggableWorkItemListItemRenderer from './WorkItem/DraggableWorkItemListItemRenderer';
import { MessageBar } from 'office-ui-fabric-react/lib/MessageBar';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { changePlanFeaturesFilter } from '../../../FeatureTimeline/redux/store/common/actioncreators';

export interface IWorkItemListItem {
    id: number;
    title: string;
    color: string;
    inProgressState: string;
    order: number;
}

export interface IWorkItemListProps {
    workItems: IWorkItemListItem[];
    filter: string;
    launchWorkItemForm: (id: number) => void;
    onPlanFeaturesFilterChanged: (filter: string) => void;
}

export interface IWorkItemListState {

}

class WorkItemList extends React.Component<IWorkItemListProps, IWorkItemListState> {
    public constructor(props: IWorkItemListProps) {
        super(props);
        this.state = {};
    }

    public render() {
        if (this.props.workItems.length === 0 || !this.props.workItems) {
            return (
                <MessageBar>No new features to plan.</MessageBar>
            );
        }

        const workItems = this._filteredItems(this.props.workItems);
        let message = null;
        if (workItems.length === 0) {
            message = <MessageBar>Only top 100 Proposed features are available.</MessageBar>;
        }

        return (
            <div className="work-item-list-container">
                <TextField
                    placeholder="Search Features"
                    onChanged={this._changeFilter}
                    value={this.props.filter}
                />
                <List
                    items={workItems}
                    onRenderCell={this._onRenderCell}
                />
                {message}
            </div>
        );
    }

    private _changeFilter = (text: string) => {
        this.props.onPlanFeaturesFilterChanged(text);
    }

    private _filteredItems = (arg0: IWorkItemListItem[]): IWorkItemListItem[] => {
        const {
            filter
        } = this.props;

        if (!filter || !arg0) {
            return arg0;
        }

        return arg0.filter(w => w.title.toLowerCase().indexOf(filter.toLowerCase()) >= 0);
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
            workItems: unplannedFeaturesSelector()(state),
            filter: planFeatureStateSelector()(state).filter
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
        onPlanFeaturesFilterChanged: (filter: string) => {
            dispatch(changePlanFeaturesFilter(filter));
        }
    };
};
export const ConnectedWorkItemsList = connect(
    makeMapStateToProps, mapDispatchToProps
)(WorkItemList);
