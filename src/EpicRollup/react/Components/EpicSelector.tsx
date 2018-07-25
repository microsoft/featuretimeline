import * as React from 'react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import './EpicSelector.scss';


export interface IEpicSelectorProps {
    projectId: string;
    teamId: string;
}

export class EpicSelector extends React.Component<IEpicSelectorProps, {}> {

    public render(): JSX.Element {
        return (<div className="epic-selector-container">
            <Dropdown
                placeHolder="Select an Epic"
                id="Epic"
                ariaLabel="Select an Epic"
                options={[
                    { key: 'E1', text: 'Option E1' },
                    { key: 'E2', text: 'Option E2' },
                    { key: 'E3', text: 'Option E3' },
                ]}
                onChanged={this._epicSelectionChanged}
            />
        </div>)

    }

    private _epicSelectionChanged() { }
}
