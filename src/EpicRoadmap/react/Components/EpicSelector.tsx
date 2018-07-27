import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import * as React from 'react';
import { connect } from 'react-redux';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { selectEpic } from '../../../Common/redux/modules/SettingsState/SettingsStateActions';
import { IEpicRoadmapState } from '../../redux/contracts';
import './EpicSelector.scss';

export interface IEpicSelectorProps {
    selectedId: number;
    epics: WorkItem[];
    selectEpic: (id: number) => void;

}

export class EpicSelectorContent extends React.Component<IEpicSelectorProps, {}> {

    public render(): JSX.Element {
        return (
            <div className="epic-selector-container">
                <ComboBox
                    label="Select an Epic:"
                    id="epic-selector"
                    ariaLabel="Select an Epic"
                    autoComplete="on"
                    allowFreeform={true}
                    options={this._getOptions()}
                    defaultSelectedKey={this.props.selectedId + ""}
                    onChanged={this._epicSelectionChanged}
                />
            </div>
        );
    }

    private _getOptions(): IComboBoxOption[] {
        const {
            epics
        } = this.props;

        return epics.map(e => {
            return {
                key: e.id + "",
                text: e.fields["System.Title"]
            }
        });
    }

    private _epicSelectionChanged = (option: IComboBoxOption) => {
        this.props.selectEpic(Number(option.key));
    }
}
const makeMapStateToProps = () => {
    return (state: IEpicRoadmapState) => {
        debugger;
        return {
            epics: state.epicsAvailableState.epics,
            selectedId: state.settingsState.lastEpicSelected
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        selectEpic: (epicId) => {
            dispatch(selectEpic(epicId));
        }
    }
}
export const EpicSelector = connect(makeMapStateToProps, mapDispatchToProps)(EpicSelectorContent)
