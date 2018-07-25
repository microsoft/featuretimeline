import "./WorkItemRenderer.scss";

import * as React from 'react';
import { getRowColumnStyle } from '../../../redux/Helpers/gridhelper';
import { IDimension } from "../../../redux/Contracts/types";

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