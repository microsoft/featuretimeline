import * as React from 'react';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import './EpicSelector.scss';


export interface IEpicSelectorProps {
    projectId: string;
    teamId: string;
}

export class EpicSelector extends React.Component<IEpicSelectorProps, {}> {

    public render(): JSX.Element {
        return (<div className="epic-selector-container">
            <ComboBox
                label="Select an Epic:"
                id="epic-selector"
                ariaLabel="Select an Epic"
                autoComplete="on"
                allowFreeform={true}
                options={this._getOptions()}
                onChanged={this._epicSelectionChanged}
            />
        </div>)

    }

    private _getOptions(): IComboBoxOption[] {
        //test data
        return [
            { key: 'Epic awesome1', text: 'Option E1' },
            { key: 'Epic awesome2', text: 'Option E2' },
            { key: 'Epic awesome3', text: 'Option E3' },
        ];
    }

    private _epicSelectionChanged(option: IComboBoxOption, index: number, value: string): void {

     }
}
