import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import * as React from 'react';
import { UIStatus } from '../../../Common/types';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { ProgressTrackingCriteria } from '../../../Common/OptionsInterfaces';
import { IWorkItemOverrideIteration } from '../../../Common/modules/OverrideIterations/overriddenIterationContracts';

initializeIcons(/* optional base url */);

export interface IEpicRollupGridProps {
    projectId: string;
    teamId: string;
    uiState: UIStatus;
    //gridView: IGridView,
    childItems: number[];
    //settingsState: ISettingsState;
    launchWorkItemForm: (id: number) => void;
    showDetails: (id: number) => void;
    closeDetails: (id: number) => void;
    clearOverrideIteration: (id: number) => void;
    dragHoverOverIteration: (iteration: string) => void;
    overrideIterationStart: (payload: IWorkItemOverrideIteration) => void;
    overrideIterationEnd: () => void;
    changeIteration: (id: number, teamIteration: TeamSettingsIteration, override: boolean) => void;
    showNIterations: (projectId: string, teamId: string, count: Number) => void;
    shiftDisplayIterationLeft: () => void;
    shiftDisplayIterationRight: () => void;
    showAllIterations: () => void;
    markInProgress: (id: number, teamIteration: TeamSettingsIteration) => void;
    toggleShowWorkItemDetails: (show: boolean) => void;
    changeProgressTrackingCriteria: (criteria: ProgressTrackingCriteria) => void;
}


export class EpicRollupGrid extends React.Component<{}, {}> {
    constructor() {
        super();
    }

    public render(): JSX.Element {
        return (<div>{"Epic Rollup is great"}</div>)
    }
}

