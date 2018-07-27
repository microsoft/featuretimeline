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
                    className="epic-selector-dropdown"
                    ariaLabel="Select an Epic"
                    options={this._getOptions()}
                    defaultSelectedKey={this.props.selectedId + ""}
                    onChanged={this._epicSelectionChanged}
                    useComboBoxAsMenuWidth={true}
                />
            </div>
        );
    }

    private _getOptions(): IComboBoxOption[] {
        const {
            epics
        } = this.props;

        const sortedEpics = epics
            .slice()
            .sort((e1, e2) => {
                const title1 = e1.fields["System.Title"] || "";
                const title2 = e2.fields["System.Title"] || "";
                return title1.localeCompare(title2);
            });

        return sortedEpics
            .map(e => {
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
