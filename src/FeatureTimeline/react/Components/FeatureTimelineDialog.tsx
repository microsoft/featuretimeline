import * as React from 'react';
import { FeatureTimelineGrid, IFeatureTimelineGridProps } from './FeatureTimelineGrid';
import { getGridView } from '../../redux/selectors/FeatureTimelineGridViewSelector';
import { getTeamIterations } from '../../redux/selectors/teamIterations';
import { TimelineDialog } from '../../../Common/react/Components/TimelineDialog/TimelineDialog';

export interface IFeatureTimelineDialogProps extends IFeatureTimelineGridProps {
    id: number;
    clearOverrideIteration: (id: number) => void;
}

export class FeatureTimelineDialog extends React.Component<IFeatureTimelineDialogProps, {}> {
    public render() {
        const workItem = this._getGridWorkItem();
        return (
            <TimelineDialog
                id={this.props.id}
                title={workItem.workItem.title}
                iterationDuration={workItem.workItem.iterationDuration}
                teamIterations={this.props.gridView.teamIterations}
                backlogIteration={this.props.gridView.backlogIteration}
                closeDetails={this.props.closeDetails}
                clearOverrideIteration={this.props.clearOverrideIteration}
                saveOverrideIteration={this.props.saveOverrideIteration}
            >
                {this._getChildrenFeatureTimelineGrid()}
            </TimelineDialog>
        );
    }

    private _getChildrenFeatureTimelineGrid() {
        const gridWorkItem = this._getGridWorkItem();
        const gridView = getGridView(
            this.props.uiState,
            this.props.gridView.backlogIteration,
            getTeamIterations(this.props.projectId, this.props.teamId, this.props.uiState, this.props.rawState),
            [gridWorkItem.workItem],
            /* workItemOverrideIteration */ null,
            this.props.settingsState,
            /* iterationDisplayOptions */ null,
            /* isSubGrid */ true);

        const childItems = this.props.childItems.filter(id => id !== this.props.id);

        const props = { ...this.props, gridView, childItems };
        if (gridView.workItems.length > 0) {
            return (
                <FeatureTimelineGrid {...props}>
                </FeatureTimelineGrid>
            );
        }
        return null;
    }

    private _getGridWorkItem() {
        return this.props.gridView.workItems.filter(w => w.workItem.id === this.props.id)[0];
    }

}

