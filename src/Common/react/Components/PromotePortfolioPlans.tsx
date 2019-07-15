import * as React from "react";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { MessageBarButton } from "office-ui-fabric-react/lib/Button";

export const PromotePortfolioPlans = () => {
    return (
        <MessageBar
            messageBarType={MessageBarType.info}
            isMultiline={false}
            actions={
                <div>
                    <MessageBarButton
                        onClick={() => {
                            const webContext = VSS.getWebContext();

                            const collectionUri = webContext.collection.uri;
                            const projectName = webContext.project.name;

                            const targerUrl = `${collectionUri}${projectName}/_apps/hub/ms-devlabs.workitem-feature-timeline-extension-dev.workitem-portfolio-planning`;

                            VSS.getService<IHostNavigationService>(VSS.ServiceIds.Navigation).then(
                                client => client.navigate(targerUrl),
                                error => alert(error)
                            );
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
