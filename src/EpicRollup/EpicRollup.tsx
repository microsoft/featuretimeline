import * as React from "react";
import * as ReactDOM from "react-dom";
import { EpicRollupView } from "./react/Components/EpicView";
import { iePollyfill } from "../polyfill";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        ReactDOM.render(
            <EpicRollupView />, document.getElementById("root"));
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