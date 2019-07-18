import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { SinglePlanTelemetry, ExtendedSinglePlanTelemetry } from "../../Models/TelemetryModels";

interface ExtensionContext {
    PublisherId: string;
    Version: string;
    Id: string;
}

interface TelemetryEventContext {
    VSID: string;
    HostId: string;
    Extension: ExtensionContext;
}

export class PortfolioTelemetry {
    private static _instance: PortfolioTelemetry;
    private _telemetryEventContext: TelemetryEventContext;
    private _telemetryEventContextProps: { [name: string]: string };

    private constructor() {
        try {
            const webContext = VSS.getWebContext();
            const extensionContext = VSS.getExtensionContext();

            this._telemetryEventContext = {
                VSID: webContext.user.id,
                HostId: webContext.host.id,
                Extension: {
                    Id: extensionContext.extensionId,
                    Version: extensionContext.version,
                    PublisherId: extensionContext.publisherId
                }
            };
        } catch (error) {
            console.log(JSON.stringify(error, null, "    "));
        } finally {
            //  set default values.
            if (!this._telemetryEventContext) {
                this._telemetryEventContext = {
                    VSID: "Unknown",
                    HostId: "Unknown",
                    Extension: {
                        Id: "Unknown",
                        Version: "Unknown",
                        PublisherId: "Unknown"
                    }
                };
            }
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
        if (!this._telemetryEventContextProps) {
            this._telemetryEventContextProps = {};
            this._telemetryEventContextProps["HostId"] = this._telemetryEventContext.HostId;
            this._telemetryEventContextProps["VSID"] = this._telemetryEventContext.VSID;
            this._telemetryEventContextProps["Extension.Id"] = this._telemetryEventContext.Extension.Id;
            this._telemetryEventContextProps[
                "Extension.PublisherId"
            ] = this._telemetryEventContext.Extension.PublisherId;
            this._telemetryEventContextProps["Extension.Version"] = this._telemetryEventContext.Extension.Version;
        }

        return this._telemetryEventContextProps;
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
