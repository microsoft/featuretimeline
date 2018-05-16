import './InfoIcon.scss';
import * as React from 'react';

export interface IInfoIconProps {
    id: number;
    useV2Styles: boolean;
    onClick: (id: number) => void;
}

export class InfoIcon extends React.Component<IInfoIconProps, {}> {
    public render() {
        const className = this.props.useV2Styles ? "info-icon2" : "info-icon";
        return (
            <div className={"bowtie-icon bowtie-status-info " + className}
                onClick={() => this.props.onClick(this.props.id)}>
                &nbsp;
            </div>
        );
    }
}