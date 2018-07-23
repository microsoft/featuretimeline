export interface IContributionContext {
    level: string;
    team: {
        id: string;
        name: string;
    };
    workItemTypes: string[];
    host: {
        background?: boolean;
    };
}

export enum UIStatus {
    Default,
    Loading,
    Error,
    NoWorkItems,
    NoTeamIterations,
}

export enum CropWorkItem {
    None,
    Left,
    Right,
    Both
}

export interface IDimension {
    startRow: number;
    startCol: number;

    endRow: number;
    endCol: number;
}
