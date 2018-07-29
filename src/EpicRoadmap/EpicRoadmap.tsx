import * as React from "react";
import * as ReactDOM from "react-dom";
import { EpicRoadmapView } from "./react/Components/EpicRoadmapView";
import { iePollyfill } from "../polyfill";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        ReactDOM.render(
            <EpicRoadmapView />, document.getElementById("root"));
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