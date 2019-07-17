export interface SinglePlanTelemetry {
    teams: number;
    projects: number;
}

export interface ExtendedSinglePlanTelemetry extends SinglePlanTelemetry {
    epicsPerProject: number[];
}
