import * as React from "react";
import * as ReactDOM from "react-dom";
import { iePollyfill } from "../polyfill";
import { ConnectedEpicTimeline } from "./Components/EpicTimeline";
import configurePortfolioPlanningStore from "./Redux/PortfolioPlanningStore";
import { Provider } from "react-redux";
import { getDefaultState } from "./Redux/Reducers/EpicTimelineReducer";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        const store = configurePortfolioPlanningStore({
            epicTimelineState: getDefaultState()
        });
        ReactDOM.render(
            <Provider store={store}>
                <ConnectedEpicTimeline />
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
