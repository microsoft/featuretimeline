import "./WorkItemRenderer.scss";

import * as React from 'react';
import { IDimension } from '../../../redux/types';
import { getRowColumnStyle } from '../gridhelper';

export interface IWorkItemShadowProps {
    dimension: IDimension;
    twoRows: boolean;
}

export class WorkItemShadow extends React.Component<IWorkItemShadowProps, {}> {
    public render() {
        const {
            dimension,
            twoRows
        } = this.props;
        const style = getRowColumnStyle(dimension);
        if (twoRows) {
            style['height'] = '52px';
        }
        return (
            <div className="work-item-shadow" style={style}>
                <div className="title">&nbsp;</div>
            </div>
        );
    }
}