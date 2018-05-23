import * as React from "react";
import * as ReactDOM from "react-dom";
import { DragDropGrid } from "./react/Components/FeatureTimelineGrid";
import { iePollyfill } from "./polyfill";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        ReactDOM.render(
            <DragDropGrid />, document.getElementById("root"));
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