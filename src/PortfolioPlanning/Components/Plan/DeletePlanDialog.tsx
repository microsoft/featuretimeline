import * as React from "react";
import { Dialog } from "azure-devops-ui/Dialog";

export interface IDeletePlanDialogProps {
    onDismiss: () => void;
    onDeleteClicked: () => void;
}

export const DeletePlanDialog = (props: IDeletePlanDialogProps) => {
    return (
        <Dialog
            titleProps={{ text: "Delete plan" }}
            footerButtonProps={[
                { text: "Cancel", onClick: props.onDismiss },
                { text: "Delete plan", onClick: props.onDeleteClicked, danger: true }
            ]}
            onDismiss={props.onDismiss}
        >
            This action can't be undone. All items in the plan will still be available in your backlogs.
        </Dialog>
    );
};
