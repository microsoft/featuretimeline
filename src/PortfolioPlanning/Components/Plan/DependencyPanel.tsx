import * as React from "react";
import { Panel } from "azure-devops-ui/Panel";

export interface IDependencyPanelProps {
    onDismiss: () => void;
}

export const DependencyPanel = (props: IDependencyPanelProps) => {
    return <Panel onDismiss={props.onDismiss} />;
};
