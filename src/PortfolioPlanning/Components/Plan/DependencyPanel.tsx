import * as React from "react";
import { Panel } from "azure-devops-ui/Panel";
import { ITimelineItem } from "../../Contracts";

export interface IDependencyPanelProps {
    workItem: ITimelineItem;
    onDismiss: () => void;
}

export const DependencyPanel = (props: IDependencyPanelProps) => {
    return (
        <Panel
            onDismiss={props.onDismiss}
            showSeparator={true}
            titleProps={{ text: `Dependencies for ${props.workItem.title}` }}
            footerButtonProps={[
                {
                    text: "Close",
                    primary: true
                }
            ]}
        />
    );
};
