import * as React from "react";
import * as ReactDOM from "react-dom";
import { iePollyfill } from "../polyfill";
import { EpicTimeline } from "./Components/EpicTimeline";
import { Projects, Epics } from "./Components/SampleData";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        ReactDOM.render(
            <EpicTimeline projects={Projects} epics={Epics} />,
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
