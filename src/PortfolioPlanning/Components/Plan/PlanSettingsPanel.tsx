import * as React from "react";
import "./PlanSettingsPanel.scss";
import { Panel } from "azure-devops-ui/Panel";
import { ComboBox } from "office-ui-fabric-react/lib/ComboBox";
import { ProgressTrackingCriteria } from "../../Contracts";

export interface IPlanSettingsProps {
    progressTrackingCriteria: ProgressTrackingCriteria;
    onProgressTrackingCriteriaChanged: (criteria: ProgressTrackingCriteria) => void;
    onClosePlanSettingsPanel: () => void;
}

export const PlanSettingsPanel = (props: IPlanSettingsProps) => {
    const completedCountKey = "completedCount";
    const effortKey = "effort";

    const selectedProgressCriteriaKey =
        props.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount ? completedCountKey : effortKey;

    return (
        <Panel onDismiss={props.onClosePlanSettingsPanel} titleProps={{ text: "Settings" }}>
            <div className="settings-container">
                <div className="progress-options settings-item">
                    <div className="progress-options-label">Track Progress Using: </div>
                    <ComboBox
                        className="progress-options-dropdown"
                        selectedKey={selectedProgressCriteriaKey}
                        allowFreeform={false}
                        autoComplete="off"
                        options={[
                            {
                                key: completedCountKey,
                                text: ProgressTrackingCriteria.CompletedCount
                            },
                            {
                                key: effortKey,
                                text: ProgressTrackingCriteria.Effort
                            }
                        ]}
                        onChanged={(item: { key: string; text: string }) => {
                            switch (item.key) {
                                case completedCountKey:
                                    props.onProgressTrackingCriteriaChanged(ProgressTrackingCriteria.CompletedCount);
                                    break;
                                case effortKey:
                                    props.onProgressTrackingCriteriaChanged(ProgressTrackingCriteria.Effort);
                                    break;
                            }
                        }}
                    />
                </div>
            </div>
        </Panel>
    );
};
