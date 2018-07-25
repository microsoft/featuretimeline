import * as React from 'react';
import { IEpicRollupGridView } from '../../redux/selectors/epicRollupGridViewSelector';
// import { getRowColumnStyle } from '../../../Common/redux/Helpers/gridhelper';
// import { IterationRenderer } from '../../../Common/react/Components/IterationRenderer';
// import { IterationDropTarget } from '../../../Common/react/Components/DroppableIterationShadow';

export interface IEpicRollupGridProps {
    projectId: string;
    teamId: string;
    gridView: IEpicRollupGridView;
}

export class EpicRollupGrid extends React.Component<IEpicRollupGridProps, {}> {

    public render(): JSX.Element {
        // const {
        //     emptyHeaderRow,
        //     iterationHeader,
        //     iterationShadow,
        //     workItems,
        //     shadowForWorkItemId,
        //     iterationDisplayOptions,
        //     isSubGrid,
        //     teamIterations
        // } = this.props.gridView;

        // const columnHeading = iterationHeader.map((iteration, index) => {
        //     const style = getRowColumnStyle(iteration.dimension);
        //     return (
        //         <div className="columnheading" style={style}>
        //             <IterationRenderer teamIterations={teamIterations} iteration={iteration.teamIteration} />
        //         </div>
        //     );

        // });

        // const shadows = iterationShadow.map((shadow, index) => {
        //     return (
        //         <IterationDropTarget
        //             {...shadow}
        //             isOverrideIterationInProgress={!!rawState.workItemOverrideIteration}
        //             onOverrideIterationOver={this.props.dragHoverOverIteration.bind(this)}
        //             changeIteration={this.props.changeIteration.bind(this)}
        //             markInProgress={this.props.markInProgress.bind(this)}
        //         >
        //             &nbsp;
        //         </IterationDropTarget>
        //     );
        // });
        return (<div>{JSON.stringify(this.props.gridView)}</div>)

    }
}
