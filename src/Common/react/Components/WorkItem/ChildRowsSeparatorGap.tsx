import "./WorkItemRenderer.scss";

import * as React from 'react';
import { getRowColumnStyle } from '../../../redux/Helpers/gridhelper';
import { IDimension } from "../../../redux/Contracts/types";

export class ChildRowsSeparator extends React.Component<IDimension, {}> {
    public render() {
        const style = getRowColumnStyle(this.props);
        return (
            <div className="child-rows-separator" style={style}>
                <div className="title"></div>
            </div>
        );
    }
}