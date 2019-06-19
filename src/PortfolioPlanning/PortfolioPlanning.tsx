import * as React from "react";
import * as ReactDOM from "react-dom";
import { iePollyfill } from "../polyfill";
import { ConnectedEpicTimeline } from "./Components/EpicTimeline";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        ReactDOM.render(
            <ConnectedEpicTimeline />,
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
