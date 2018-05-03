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
