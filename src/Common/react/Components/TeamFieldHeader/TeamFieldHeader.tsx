import "./TeamFieldHeader.scss";
import * as React from "react";
import { IDimension } from "../../../redux/Contracts/types";
import { getRowColumnStyle } from "../../../redux/Helpers/gridhelper";

export interface ITeamFieldHeaderProps {
    dimension: IDimension
}

export class TeamFieldHeader extends React.Component<ITeamFieldHeaderProps, {}> {
    public render(): JSX.Element {
        const {
            dimension,
        } = this.props;


        const style = getRowColumnStyle(dimension);
        return (
            <div className="team-field-header" style={style}>
                <div className="team-field-text">
                    <span>{"Area Path"}</span>
                </div>
            </div>
        );
    }
}