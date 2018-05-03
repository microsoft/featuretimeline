import "./WorkItemRenderer.scss";

import * as React from 'react';
import { IDimension } from '../../../redux/types';
import { getRowColumnStyle } from '../gridhelper';

export class WorkItemShadow extends React.Component<IDimension, {}> {
    public render() {
        const style = getRowColumnStyle(this.props);
        return (
            <div className="work-item-shadow" style={style}>
                <div className="title">x</div>
            </div>
        );
    }
}