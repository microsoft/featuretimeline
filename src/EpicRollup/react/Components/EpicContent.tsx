import * as React from 'react';

export interface IEpicContentProps {
    projectId: string;
    teamId: string; 
}

export class EpicContent extends React.Component<IEpicContentProps, {}> {

    public render(): JSX.Element {
        return (<div>{"Epic Rollup is great"}</div>)

    }
}
