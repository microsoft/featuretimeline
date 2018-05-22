import * as tc from "telemetryclient-team-services-extension";

export const settings: tc.TelemetryClientSettings = {
    key: "d74efa46-f231-4cb1-9a17-53f175096396",
    extensioncontext: "FeatureTimeline",
    disableTelemetry: "false",
    disableAjaxTracking: "true",
    enableDebug: "false"
}

export function getClient(): tc.TelemetryClient {
    return tc.TelemetryClient.getClient(settings);
}


export function track(
    eventName: string,
    properties?: IDictionaryStringTo<string>,
    measurements?: IDictionaryStringTo<number>) {

    try {
        if (!window["telemetryClient"]) {
            window["telemetryClient"] = getClient();
        }
        const client = window["telemetryClient"] as tc.TelemetryClient;
        client.trackEvent(eventName, properties, measurements);
    }
    catch (error) {
        console.log("Error while tracking telemetry");
    }
}

export function trackTTI(eventName: string, time: number) {
    track(eventName, getContextProperties(), {
        "tti": time
    })
}



export function getContextProperties() {
    const webContext = VSS.getWebContext();
    const context = {};
    for (const key in webContext.account) {
        context[`account_${key}`] = webContext.account[key];
    }

    for (const key in webContext.project) {
        context[`project_${key}`] = webContext.account[key];
    }

    for (const key in webContext.team) {
        context[`team_${key}`] = webContext.account[key];
    }

    return context;
}