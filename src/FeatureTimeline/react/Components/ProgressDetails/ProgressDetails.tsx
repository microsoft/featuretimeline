import './ProgressDetails.scss';
import * as React from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IProgressIndicator } from '../../../../Common/Contracts/GridViewContracts';

export interface IProgressIndicatorProps extends IProgressIndicator {
    onClick: () => void;
}

export class ProgressDetails extends React.Component<IProgressIndicatorProps, {}> {
    public render() {
        const {
            total,
            completed,
            onClick
        } = this.props;

        if (total <= 0) {
            return null;
        }

        const style = {};
        style['width'] = `${(completed * 100 / total)}%`;
        const progressText = `${completed}/${total}`;
        return (
            <TooltipHost content={progressText} className="progress-indicator-tooltip">
                <div className="progress-indicator-container" onClick={onClick}>
                    <div className="progress-details-parts">
                        <div className="progress-completed" style={style} />
                    </div>
                    <div className="progress-text"> {progressText}</div>
                </div>
            </TooltipHost>
        )
    }
}