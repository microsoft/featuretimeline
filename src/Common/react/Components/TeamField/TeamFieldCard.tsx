import "./TeamFieldCard.scss";
import * as React from "react";
import { IDimension } from "../../../redux/Contracts/types";
import { getRowColumnStyle } from "../../../redux/Helpers/gridhelper";
import { Label } from 'office-ui-fabric-react/lib/Label';

export interface ITeamFieldCardProps {
    dimension: IDimension;
    teamField: string;
}
export class TeamFieldCard extends React.Component<ITeamFieldCardProps, {}> {
    public render() {
        const {
            dimension,
            teamField
        } = this.props;
        const style = getRowColumnStyle(dimension);
        return (
            <div
                className="team-field-card"
                style={style}
            >
                <Label>{teamField}</Label>
            </div>
        );
    }
}