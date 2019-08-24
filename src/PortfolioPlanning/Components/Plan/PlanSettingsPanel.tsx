import * as React from "react";
import "./PlanSettingsPanel.scss";
import { Panel } from "azure-devops-ui/Panel";
import { ComboBox } from "office-ui-fabric-react/lib/ComboBox";
import { UserSettings } from "../../Models/UserSettingsDataModels";
import { ProgressTrackingUserSetting, RollupHierachyUserSetting } from "../../Contracts";

export interface IPlanSettingsProps {
    userSettings: UserSettings;
    onProgressTrackingCriteriaChanged: (criteria: ProgressTrackingUserSetting.Options) => void;
    onTimelineItemRollupChanged: (criteria: RollupHierachyUserSetting.Options) => void;
    onClosePlanSettingsPanel: () => void;
}

export const PlanSettingsPanel = (props: IPlanSettingsProps) => {
    return (
        <Panel onDismiss={props.onClosePlanSettingsPanel} titleProps={{ text: "Settings" }}>
            <div className="settings-container">
                <div className="progress-options settings-item">
                    <div className="progress-options-label">Track Progress Using: </div>
                    <ComboBox
                        className="progress-options-dropdown"
                        selectedKey={props.userSettings.ProgressTrackingOption}
                        allowFreeform={false}
                        autoComplete="off"
                        options={[
                            {
                                key: ProgressTrackingUserSetting.CompletedCount.Key,
                                text: ProgressTrackingUserSetting.CompletedCount.Text
                            },
                            {
                                key: ProgressTrackingUserSetting.Effort.Key,
                                text: ProgressTrackingUserSetting.Effort.Text
                            }
                        ]}
                        onChanged={(item: { key: string; text: string }) => {
                            props.onProgressTrackingCriteriaChanged(item.key as ProgressTrackingUserSetting.Options);
                        }}
                    />
                </div>
                <div className="progress-options settings-item">
                    <div className="progress-options-label">Track Progress Using: </div>
                    <ComboBox
                        className="progress-options-dropdown"
                        selectedKey={props.userSettings.TimelineItemRollup}
                        allowFreeform={false}
                        autoComplete="off"
                        options={[
                            {
                                key: RollupHierachyUserSetting.Children.Key,
                                text: RollupHierachyUserSetting.Children.Text
                            },
                            {
                                key: RollupHierachyUserSetting.Descendants.Key,
                                text: RollupHierachyUserSetting.Descendants.Text
                            }
                        ]}
                        onChanged={(item: { key: string; text: string }) => {
                            props.onTimelineItemRollupChanged(item.key as RollupHierachyUserSetting.Options);
                        }}
                    />
                </div>
            </div>
        </Panel>
    );
};
