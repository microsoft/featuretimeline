import { StorageConstants, UserSettings } from "../../Models/UserSettingsDataModels";
import { PortfolioTelemetry } from "../Utilities/Telemetry";
import { ExtensionStorageError, IQueryResultError } from "../../Models/PortfolioPlanningQueryModels";
import { ProgressTrackingUserSetting, RollupHierachyUserSetting } from "../../Contracts";

export class UserSettingsDataService {
    private static _instance: UserSettingsDataService;
    private _vsid: string = null;
    private _telemetry: PortfolioTelemetry;

    private constructor() {
        try {
            const webContext = VSS.getWebContext();
            this._vsid = webContext.user.id;
            this._telemetry = PortfolioTelemetry.getInstance();
        } catch (error) {
            PortfolioTelemetry.getInstance().TrackException(error);
        } finally {
            //  set default values.
            this._vsid = null;
        }
    }

    public static getInstance(): UserSettingsDataService {
        if (!UserSettingsDataService._instance) {
            UserSettingsDataService._instance = new UserSettingsDataService();
        }
        return UserSettingsDataService._instance;
    }

    public async getUserSettings(): Promise<UserSettings> {
        if (!this._vsid) {
            this._telemetry.TrackAction("UserSettingsDataService/NullVSID");
            return Promise.resolve(this.getDefaultUserSettings());
        }

        const client = await this.getStorageClient();
        let settings: UserSettings = this.getDefaultUserSettings();
        let document: any = null;

        try {
            document = await client.getDocument(StorageConstants.COLLECTION_NAME, this._vsid);
            settings = this.parseUserSettingsDocument(document);
        } catch (error) {
            this._telemetry.TrackException(error);
            const parsedError = this.ParseStorageError(error);

            if (parsedError.status === 404) {
                //  Collection/document has not been created, initialize it.
                try {
                    await client.setDocument(StorageConstants.COLLECTION_NAME, settings);
                } catch (error) {
                    this._telemetry.TrackException(error);
                }
            }
        }

        return settings;
    }

    public async updateUserSettings(latestSettings: UserSettings): Promise<void> {
        if (!this._vsid) {
            this._telemetry.TrackAction("UserSettingsDataService/updateUserSettings/NullVSID");
            return Promise.resolve();
        }

        const client = await this.getStorageClient();
        latestSettings.id = this._vsid;

        try {
            await client.updateDocument(StorageConstants.COLLECTION_NAME, latestSettings);
        } catch (error) {
            this._telemetry.TrackException(error);
        }
    }

    public getDefaultUserSettings(): UserSettings {
        return {
            Schema: StorageConstants.CURRENT_USER_SETTINGS_SCHEMA_VERSION,
            id: this._vsid,
            ProgressTrackingOption: this.getDefaultProgressTrackingOption(),
            TimelineItemRollup: this.getDefaultTimelineItemRollup()
        };
    }

    private async getStorageClient(): Promise<IExtensionDataService> {
        return VSS.getService<IExtensionDataService>(VSS.ServiceIds.ExtensionData);
    }

    private parseUserSettingsDocument(doc: any): UserSettings {
        if (!doc) {
            this._telemetry.TrackAction("UserSettingsDataService/ParseUserSettings/NoDoc");
            return this.getDefaultUserSettings();
        }

        const settings: UserSettings = doc;

        //  Set default values if not present.
        if (!settings.ProgressTrackingOption) {
            settings.ProgressTrackingOption = this.getDefaultProgressTrackingOption();
        }

        if (!settings.TimelineItemRollup) {
            settings.TimelineItemRollup = this.getDefaultTimelineItemRollup();
        }

        return settings;
    }

    private ParseStorageError(error: any): IQueryResultError {
        if (!error) {
            return {
                exceptionMessage: "no error information"
            };
        }

        const parsedError: ExtensionStorageError = error;

        return {
            exceptionMessage: parsedError.message,
            status: parsedError.status
        };
    }

    private getDefaultProgressTrackingOption(): ProgressTrackingUserSetting.Options {
        return ProgressTrackingUserSetting.Options.CompletedCount;
    }

    private getDefaultTimelineItemRollup(): RollupHierachyUserSetting.Options {
        return RollupHierachyUserSetting.Options.Descendants;
    }
}
