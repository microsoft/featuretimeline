import "./WorkItemRenderer.scss";

import * as React from 'react';
import { IDimension } from '../../../redux/types';
import { getRowColumnStyle } from '../gridhelper';

export class WorkitemGap extends React.Component<IDimension, {}> {
    public render() {
        const style = getRowColumnStyle(this.props);
        return (
            <div className="work-item-gap" style={style}>
                <div className="title"></div>
            </div>
        );
    }
}