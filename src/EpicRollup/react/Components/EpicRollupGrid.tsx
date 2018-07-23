import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import * as React from 'react';

initializeIcons(/* optional base url */);


export class EpicRollupGrid extends React.Component<{}, {}> {
    constructor() {
        super();
    }

    public render(): JSX.Element {
        return (<div>{"Epic Rollup is great"}</div>)
    }
}

