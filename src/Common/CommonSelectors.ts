import { IContributionContext } from "./types";

export const getProjectId = () => {
    const webContext = VSS.getWebContext();
    return webContext.project.id;
}

export const getTeamId = () => {
    const contributionContext: IContributionContext = VSS.getConfiguration();
    if (contributionContext.team) {
        return contributionContext.team.id;
    }
    const webContext = VSS.getWebContext();
    return webContext.team.id;
};
