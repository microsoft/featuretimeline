import './ProgressDetails.scss';
import * as React from 'react';
import { IProgressIndicator } from '../../../redux/selectors/gridViewSelector';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';

export interface IProgressIndicatorProps extends IProgressIndicator {
    onClick: () => void;
}

export class ProgressDetails extends React.Component<IProgressIndicatorProps, {}> {
    public render() {
        const {
            childCount,
            completedCount,
            onClick
        } = this.props;

        if (childCount <= 0) {
            return null;
        }

        const style = {};
        style['width'] = `${(completedCount * 100 / childCount)}%`;
        const tooltip = `${completedCount} of ${childCount} completed.`;
        return (
            <div className="progress-indicator-container"
                onClick={onClick}
            >
                <TooltipHost
                    content={tooltip}
                >
                    <div className="progress-details-parts-container">
                        <div className="progress-completed" style={style} />
                    </div>
                </TooltipHost >
            </div>
        )
    }
}