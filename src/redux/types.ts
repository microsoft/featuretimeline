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
