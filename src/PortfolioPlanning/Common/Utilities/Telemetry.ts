import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { SinglePlanTelemetry, ExtendedSinglePlanTelemetry } from "../../Models/TelemetryModels";
import { IProjectConfiguration } from "../../Contracts";

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

    public TrackPlanOpened(planId: string, payload: ExtendedSinglePlanTelemetry) {
        try {
            AppInsightsClient.getAppInsightsInstance().trackEvent({
                name: "PlansDirectory.PlanOpened",
                properties: {
                    ...this.getCommonPayload(),
                    ["PlanId"]: planId,
                    ["Plan"]: payload
                }
            });
        } catch (error) {
            console.log(JSON.stringify(error, null, "    "));
        }
    }

    public TrackAddItemPanelProjectSelected(projectId: string, config: IProjectConfiguration) {
        try {
            const typeCountPerLevel: { [levelName: string]: number } = {};

            Object.keys(config.backlogLevelNamesByWorkItemType).forEach(wiTypeKey => {
                const levelNameKey = config.backlogLevelNamesByWorkItemType[wiTypeKey].toLowerCase();

                if (!typeCountPerLevel[levelNameKey]) {
                    typeCountPerLevel[levelNameKey] = 0;
                }

                typeCountPerLevel[levelNameKey]++;
            });

            AppInsightsClient.getAppInsightsInstance().trackEvent({
                name: "AddItemPanel.ProjectSelected",
                properties: {
                    ...this.getCommonPayload(),
                    ["ProjectId"]: projectId,
                    ["WorkItemTypeCount"]: config.orderedWorkItemTypes!.length || 0,
                    ["WorkItemTypeCountPerBacklogLevel"]: Object.keys(typeCountPerLevel).map(
                        levelName => typeCountPerLevel[levelName]
                    )
                }
            });
        } catch (error) {
            console.log(JSON.stringify(error, null, "    "));
        }
    }

    public TrackAddItemPanelWorkItemsOfTypeCount(projectId: string, workItemType: string, count: number) {
        try {
            AppInsightsClient.getAppInsightsInstance().trackEvent({
                name: "AddItemPanel.WorkItemsOfTypeCount",
                properties: {
                    ...this.getCommonPayload(),
                    ["ProjectId"]: projectId,
                    ["WorkItemType"]: workItemType,
                    ["Count"]: count
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

        try {
            const webContext = VSS.getWebContext();
            this._appInsights.setAuthenticatedUserContext(webContext.user.id, webContext.host.id);
        } catch (error) {
            console.log(`Failed to setAuthenticatedUserContext`);
            console.log(error);
        }
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
        result.instrumentationKey = "3ebb5cca-565e-4f7c-b54a-43476b04e0a7";

        return result;
    }
}
