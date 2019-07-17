import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { SinglePlanTelemetry, ExtendedSinglePlanTelemetry } from "../../Models/TelemetryModels";

export class PortfolioTelemetry {
    private static _instance: PortfolioTelemetry;
    private _vsid: string;
    private _hostId: string;

    private constructor() {
        try {
            this._vsid = VSS.getWebContext().user.id;
            this._hostId = VSS.getWebContext().host.id;
        } catch (error) {
            console.log(JSON.stringify(error, null, "    "));
        } finally {
            //  set default values.
            this._vsid = this._vsid || "UnknownVSID";
            this._hostId = this._hostId || "UnknownHostId";
        }
    }

    public static getInstance(): PortfolioTelemetry {
        if (!this._instance) {
            console.log("Creating a new PortfolioTelemetry instance.");
            this._instance = new PortfolioTelemetry();
        }

        return this._instance;
    }

    public TrackPlansLoaded(payload: SinglePlanTelemetry[]) {
        try {
            AppInsightsClient.getAppInsightsInstance().trackEvent({
                name: "PlansDirectory.PlansLoaded",
                properties: {
                    ...this.getCommonPayload(),
                    ["PlansCount"]: payload.length,
                    ["Plans"]: payload
                }
            });
        } catch (error) {
            console.log(JSON.stringify(error, null, "    "));
        }
    }

    public TrackPlanOpened(payload: ExtendedSinglePlanTelemetry) {
        try {
            AppInsightsClient.getAppInsightsInstance().trackEvent({
                name: "PlansDirectory.PlanOpened",
                properties: {
                    ...this.getCommonPayload(),
                    ["Plan"]: payload
                }
            });
        } catch (error) {
            console.log(JSON.stringify(error, null, "    "));
        }
    }

    public TrackException(exception: Error) {
        try {
            AppInsightsClient.getAppInsightsInstance().trackException({
                error: exception,
                properties: {
                    ...this.getCommonPayload()
                }
            });
        } catch (error) {
            console.log(JSON.stringify(error, null, "    "));
        }
    }

    public TrackAction(actionName: string, properties?: { [key: string]: any }) {
        try {
            AppInsightsClient.getAppInsightsInstance().trackEvent({
                name: actionName,
                properties: {
                    ...this.getCommonPayload(),
                    ...properties
                }
            });
        } catch (error) {
            console.log(JSON.stringify(error, null, "    "));
        }
    }

    private getCommonPayload(): { [key: string]: string } {
        return {
            ["VSID"]: this._vsid,
            ["HostId"]: this._hostId
        };
    }
}

/**
 * Full documentation for all configuration options is here:
 * https://github.com/Microsoft/ApplicationInsights-JS#Configuration
 */
export class AppInsightsConfig {
    /**
     * Required
     * Instrumentation key that you obtained from the Azure Portal.
     */
    public instrumentationKey: string;

    /**
     * If true, exceptions are no autocollected. Default is false.
     */
    public disableExceptionTracking: boolean = false;
}

export class AppInsightsClient {
    private static _instance: AppInsightsClient;
    private _appInsights: ApplicationInsights;

    private constructor() {
        const config = this.getDefaultConfig();

        this._appInsights = new ApplicationInsights({
            config: config
        });
        this._appInsights.loadAppInsights();
    }

    public static getInstance(): AppInsightsClient {
        if (!this._instance) {
            console.log("Creating a new AppInsightsClient instance.");
            this._instance = new AppInsightsClient();
        }

        return this._instance;
    }

    public static getAppInsightsInstance(): ApplicationInsights {
        return this.getInstance()._appInsights;
    }

    private getDefaultConfig(): AppInsightsConfig {
        const result = new AppInsightsConfig();
        result.instrumentationKey = "a91fdcf6-4456-4692-98d3-e390c0b65939";

        return result;
    }
}
