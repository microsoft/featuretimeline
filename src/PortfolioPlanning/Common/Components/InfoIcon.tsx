import "./InfoIcon.scss";
import * as React from "react";

export interface IInfoIconProps {
    className?: string;
    id: number;
    onClick: (id: number) => void;
}

export class InfoIcon extends React.Component<IInfoIconProps, {}> {
    public render() {
        return (
            <div
                className={"bowtie-icon bowtie-status-info info-icon " + this.props.className}
                onClick={() => this.props.onClick(this.props.id)}
            >
                &nbsp;
            </div>
        );
    }
}
