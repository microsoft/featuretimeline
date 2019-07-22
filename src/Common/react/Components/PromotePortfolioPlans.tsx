import * as React from "react";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { MessageBarButton } from "office-ui-fabric-react/lib/Button";

export interface IPromotePortfolioPlansBanner {
    onDismiss: () => void;
}

export const PromotePortfolioPlansBanner = (props: IPromotePortfolioPlansBanner) => {
    return (
        <MessageBar
            messageBarType={MessageBarType.info}
            isMultiline={false}
            onDismiss={props.onDismiss}
            actions={
                <div>
                    <MessageBarButton
                        onClick={() => {
                            const webContext = VSS.getWebContext();

                            const collectionUri = webContext.collection.uri;
                            const projectName = webContext.project.name;
                            const extensionContext = VSS.getExtensionContext()

                            const targerUrl = `${collectionUri}${projectName}/_apps/hub/${extensionContext.publisherId}.${extensionContext.extensionId}.workitem-portfolio-planning`;

                            VSS.getService<IHostNavigationService>(VSS.ServiceIds.Navigation).then(
                                client => client.navigate(targerUrl),
                                error => alert(error)
                            );

                            props.onDismiss();
                        }}
                    >
                        Try it now!
                    </MessageBarButton>
                </div>
            }
        >
            <div>{"Track epics across projects and teams in the Portfolio Plans hub."}</div>
        </MessageBar>
    );
};
