import * as React from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';

export interface IAddEpicDialogProps {
    onCloseAddEpicDialog: () => void;
}
export class AddEpicDialog extends React.Component<IAddEpicDialogProps, {}> {
    public render() {
        return (
            <Dialog 
                hidden={false} 
                onDismiss={()=>this.props.onCloseAddEpicDialog()}  
                dialogContentProps={
                    {
                        type: DialogType.close,
                        title: "hello"
                    }
                }
                modalProps={
                    {
                        isBlocking: true,
                    }
                }
            >
                add epic
            </Dialog>
        )
    }
}