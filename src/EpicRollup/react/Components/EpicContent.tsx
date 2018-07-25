import * as React from 'react';
import { IEpicRollupGridView } from '../../redux/selectors/epicRollupGridViewSelector';

export interface IEpicContentProps {
    projectId: string;
    teamId: string; 
    gridView: IEpicRollupGridView;
}

export class EpicContent extends React.Component<IEpicContentProps, {}> {

    public render(): JSX.Element {
        return (<div>{JSON.stringify(this.props.gridView)}</div>)

    }
}
