import { RollupHierachyUserSetting, ProgressTrackingUserSetting } from "../Contracts";

export class StorageConstants {
    public static COLLECTION_NAME: string = "UserSettings";
    public static CURRENT_USER_SETTINGS_SCHEMA_VERSION: number = 1;
}

export interface UserSettings {
    Schema: number;
    id: string;
    ProgressTrackingOption: ProgressTrackingUserSetting.Options;
    TimelineItemRollup: RollupHierachyUserSetting.Options;
}
