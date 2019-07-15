import * as React from "react";
import * as ReactDOM from "react-dom";
import { iePollyfill } from "../polyfill";
import configurePortfolioPlanningStore from "./Redux/PortfolioPlanningStore";
import { Provider } from "react-redux";
import * as PlanDirectoryReducer from "./Redux/Reducers/PlanDirectoryReducer";
import * as EpicTimelineReducer from "./Redux/Reducers/EpicTimelineReducer";
import { ConnectedPlanDirectory } from "./Components/Directory/PlanDirectory";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        const store = configurePortfolioPlanningStore({
            planDirectoryState: PlanDirectoryReducer.getDefaultState(),
            epicTimelineState: EpicTimelineReducer.getDefaultState()
        });

        ReactDOM.render(
            <Provider store={store}>
                <ConnectedPlanDirectory />
            </Provider>,
            document.getElementById("root")
        );
    }
}

export function unmount(): void {
    if (!isBackground()) {
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
    }
}

function isBackground() {
    const contributionContext = VSS.getConfiguration();
    return contributionContext.host && contributionContext.host.background;
}
