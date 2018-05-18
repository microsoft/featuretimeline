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
        const progressText = `${completedCount}/${childCount}`;
        return (
            <div className="progress-indicator-container" onClick={onClick}>
                <div className="progress-details-parts">
                    <div className="progress-completed" style={style} />
                </div>
                <TooltipHost content={progressText}>
                    <div className="progress-text"> {progressText}</div>
                </TooltipHost>
            </div>
        )
    }
}