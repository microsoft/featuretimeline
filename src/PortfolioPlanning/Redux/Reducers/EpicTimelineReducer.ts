import { IEpicTimelineState } from "../Contracts";
import {
    EpicTimelineActions,
    EpicTimelineActionTypes,
    PortfolioItemsReceivedAction,
    PortfolioItemDeletedAction
} from "../Actions/EpicTimelineActions";
import produce from "immer";
import { ProgressTrackingCriteria, LoadingStatus, IWorkItemIcon } from "../../Contracts";
import { MergeType } from "../../Models/PortfolioPlanningQueryModels";
import { defaultIProjectComparer, defaultIWorkItemComparer } from "../../Common/Utilities/Comparers";

export function epicTimelineReducer(state: IEpicTimelineState, action: EpicTimelineActions): IEpicTimelineState {
    return produce(state || getDefaultState(), (draft: IEpicTimelineState) => {
        switch (action.type) {
            case EpicTimelineActionTypes.UpdateDates: {
                const { epicId, startDate, endDate } = action.payload;
                const epicToUpdate = draft.epics.find(epic => epic.id === epicId);
                {
                epicToUpdate.startDate = startDate.toDate();
                epicToUpdate.startDate.setHours(0, 0, 0, 0);
                epicToUpdate.endDate = endDate.toDate();
                epicToUpdate.endDate.setHours(0, 0, 0, 0);
                epicToUpdate.itemUpdating = true;}
                break;
            }
            case EpicTimelineActionTypes.ShiftItem: {
                const { itemId, startDate } = action.payload;

                const epicToUpdate = draft.epics.find(epic => epic.id === itemId);

                const epicDuration = epicToUpdate.endDate.getTime() - epicToUpdate.startDate.getTime();

                epicToUpdate.startDate = startDate.toDate();
                epicToUpdate.startDate.setHours(0, 0, 0, 0);
                epicToUpdate.endDate = startDate.add(epicDuration, "milliseconds").toDate();
                epicToUpdate.endDate.setHours(0, 0, 0, 0);
                epicToUpdate.itemUpdating = true;
                break;
            }
            case EpicTimelineActionTypes.UpdateItemFinished: {
                const { itemId } = action.payload;
                const epicToUpdate = draft.epics.find(epic => epic.id === itemId);
                epicToUpdate.itemUpdating = false;
                break;
            }
            case EpicTimelineActionTypes.ToggleItemDetailsDialogHidden: {
                const { hidden } = action.payload;

                draft.setDatesDialogHidden = hidden;

                break;
            }
            case EpicTimelineActionTypes.SetSelectedItemId: {
                const { id } = action.payload;

                draft.selectedItemId = id;

                break;
            }
            case EpicTimelineActionTypes.PortfolioItemsReceived: {
                const { result } = action.payload;
                const { items, projects } = result;

                draft.planLoadingStatus = LoadingStatus.Loaded;
                draft.exceptionMessage = items.exceptionMessage || projects.exceptionMessage;
               
                handlePortfolioItemsReceived(draft, action as PortfolioItemsReceivedAction);
                break;
            }
            case EpicTimelineActionTypes.OpenAddItemPanel: {
                draft.addItemsPanelOpen = true;
                break;
            }
            case EpicTimelineActionTypes.CloseAddItemPanel: {
                draft.addItemsPanelOpen = false;
                draft.isNewPlanExperience = false;
                break;
            }
            case EpicTimelineActionTypes.PortfolioItemDeleted: {
                handlePortfolioItemDeleted(state, action as PortfolioItemDeletedAction);
                break;
            }
            case EpicTimelineActionTypes.ToggleProgressTrackingCriteria: {
                draft.progressTrackingCriteria = action.payload.criteria;
                break;
            }
            case EpicTimelineActionTypes.ToggleLoadingStatus: {
                const { status } = action.payload;

                draft.planLoadingStatus = status;

                break;
            }
            case EpicTimelineActionTypes.ResetPlanState: {
                draft.planLoadingStatus = LoadingStatus.NotLoaded;
                draft.selectedItemId = undefined;
                draft.setDatesDialogHidden = true;
                draft.addItemsPanelOpen = false;
                draft.planSettingsPanelOpen = false;
                draft.epics = [];
                draft.projects = [];
                draft.teams = {};
                draft.isNewPlanExperience = false;
                draft.deletePlanDialogHidden = true;

                break;
            }
            case EpicTimelineActionTypes.TogglePlanSettingsPanelOpen: {
                const { isOpen } = action.payload;

                draft.planSettingsPanelOpen = isOpen;

                break;
            }
            case EpicTimelineActionTypes.ToggleIsNewPlanExperience: {
                draft.isNewPlanExperience = action.payload.isNewPlanExperience;
                break;
            }
            case EpicTimelineActionTypes.ToggleDeletePlanDialogHidden: {
                draft.deletePlanDialogHidden = action.payload.hidden;
                break;
            }
            case EpicTimelineActionTypes.HandleGeneralException: {
                draft.exceptionMessage = action.payload.message || action.payload.exceptionMessage;
                break;
            }
            case EpicTimelineActionTypes.DismissErrorMessageCard: {
                draft.exceptionMessage = "";
                break;
            }
        }
    });
}

export function getDefaultState(): IEpicTimelineState {
    return {
        planLoadingStatus: LoadingStatus.NotLoaded,
        exceptionMessage: "",
        projects: [],
        teams: {},
        epics: [],
        message: "Initial message",
        addItemsPanelOpen: false,
        setDatesDialogHidden: true,
        planSettingsPanelOpen: false,
        selectedItemId: null,
        progressTrackingCriteria: ProgressTrackingCriteria.CompletedCount,
        isNewPlanExperience: false,
        deletePlanDialogHidden: true,
        planTelemetry: null
    };
}

function handlePortfolioItemsReceived(
    state: IEpicTimelineState,
    action: PortfolioItemsReceivedAction
): IEpicTimelineState {
    return produce(state, draft => {
        const { result, projectConfigurations } = action.payload;
        const { items, projects, teamAreas, mergeStrategy } = result;
        if (mergeStrategy === MergeType.Replace) {
            draft.projects = projects.projects.map(project => {
                return {
                    id: project.ProjectSK,
                    title: project.ProjectName,
                    configuration: projectConfigurations[project.ProjectSK.toLowerCase()]
                };
            });

            draft.epics = items.items.map(item => {
                //  Using the first team found for the area, if available.
                const teamIdValue: string =
                    teamAreas.teamsInArea[item.AreaId] && teamAreas.teamsInArea[item.AreaId][0]
                        ? teamAreas.teamsInArea[item.AreaId][0].teamId
                        : null;

                const backlogLevelName: string = projectConfigurations[item.ProjectId]
                    ? projectConfigurations[item.ProjectId].backlogLevelNamesByWorkItemType[
                          item.WorkItemType.toLowerCase()
                      ]
                    : null;

                const iconProps: IWorkItemIcon = projectConfigurations[item.ProjectId]
                    ? projectConfigurations[item.ProjectId].iconInfoByWorkItemType[item.WorkItemType.toLowerCase()]
                    : null;

                return {
                    id: item.WorkItemId,
                    backlogLevel: backlogLevelName,
                    project: item.ProjectId,
                    teamId: teamIdValue,
                    title: item.Title,
                    iconProps,
                    startDate: item.StartDate,
                    endDate: item.TargetDate,
                    completedCount: item.CompletedCount,
                    totalCount: item.TotalCount,
                    completedEffort: item.CompletedEffort,
                    totalEffort: item.TotalEffort,
                    effortProgress: item.EffortProgress,
                    countProgress: item.CountProgress,
                    itemUpdating: false
                };
            });

            draft.teams = {};

            if (teamAreas.teamsInArea) {
                Object.keys(teamAreas.teamsInArea).forEach(areaId => {
                    const teams = teamAreas.teamsInArea[areaId];

                    teams.forEach(team => {
                        if (!draft.teams[team.teamId]) {
                            draft.teams[team.teamId] = {
                                teamId: team.teamId,
                                teamName: team.teamName
                            };
                        }
                    });
                });
            }
        } else if (mergeStrategy === MergeType.Add) {
            projects.projects.forEach(newProjectInfo => {
                const filteredProjects = draft.projects.filter(p => p.id === newProjectInfo.ProjectSK);

                if (filteredProjects.length === 0) {
                    draft.projects.push({
                        id: newProjectInfo.ProjectSK,
                        title: newProjectInfo.ProjectName,
                        configuration: projectConfigurations[newProjectInfo.ProjectSK.toLowerCase()]
                    });
                }
            });

            //  TODO    change draft.projects and draft.epics to maps
            items.items.forEach(newItemInfo => {
                const filteredItems = draft.epics.filter(p => p.id === newItemInfo.WorkItemId);

                if (filteredItems.length === 0) {
                    //  Using the first team found for the area, if available.
                    const teamIdValue: string =
                        teamAreas.teamsInArea[newItemInfo.AreaId] && teamAreas.teamsInArea[newItemInfo.AreaId][0]
                            ? teamAreas.teamsInArea[newItemInfo.AreaId][0].teamId
                            : null;

                    const backlogLevelName: string = projectConfigurations[newItemInfo.ProjectId]
                        ? projectConfigurations[newItemInfo.ProjectId].backlogLevelNamesByWorkItemType[
                              newItemInfo.WorkItemType.toLowerCase()
                          ]
                        : null;

                    const iconProps: IWorkItemIcon = projectConfigurations[newItemInfo.ProjectId]
                        ? projectConfigurations[newItemInfo.ProjectId].iconInfoByWorkItemType[
                              newItemInfo.WorkItemType.toLowerCase()
                          ]
                        : null;

                    draft.epics.push({
                        id: newItemInfo.WorkItemId,
                        backlogLevel: backlogLevelName,
                        project: newItemInfo.ProjectId,
                        teamId: teamIdValue,
                        iconProps,
                        title: newItemInfo.Title,
                        startDate: newItemInfo.StartDate,
                        endDate: newItemInfo.TargetDate,
                        completedCount: newItemInfo.CompletedCount,
                        totalCount: newItemInfo.TotalCount,
                        completedEffort: newItemInfo.CompletedEffort,
                        totalEffort: newItemInfo.TotalEffort,
                        effortProgress: newItemInfo.EffortProgress,
                        countProgress: newItemInfo.CountProgress,
                        itemUpdating: false
                    });
                }
            });

            if (teamAreas.teamsInArea && draft.teams) {
                Object.keys(teamAreas.teamsInArea).forEach(areaId => {
                    const teams = teamAreas.teamsInArea[areaId];

                    teams.forEach(team => {
                        if (!draft.teams[team.teamId]) {
                            draft.teams[team.teamId] = {
                                teamId: team.teamId,
                                teamName: team.teamName
                            };
                        }
                    });
                });
            }

            //  Sort projects by name for displaying in the timeline.
            draft.projects.sort(defaultIProjectComparer);

            //  Not loading anymore.
            draft.planLoadingStatus = LoadingStatus.Loaded;
        }

        //  Sort timeline items by name.
        if (draft.epics) {
            draft.epics.sort(defaultIWorkItemComparer);
        }
    });
}

function handlePortfolioItemDeleted(state: IEpicTimelineState, action: PortfolioItemDeletedAction): IEpicTimelineState {
    return produce(state, draft => {
        const { itemIdToRemove } = action.payload;

        const indexToRemoveEpic = state.epics.findIndex(epic => epic.id === itemIdToRemove);

        const removedEpic = draft.epics.splice(indexToRemoveEpic, 1)[0];
        draft.selectedItemId = undefined;

        // Remove the project if it's the last epic in the project
        if (!draft.epics.some(epic => epic.project === removedEpic.project)) {
            const indexToRemoveProject = state.projects.findIndex(project => project.id === removedEpic.project);
            draft.projects.splice(indexToRemoveProject, 1);
        }

        // Remove team if all team items have been removed.
        Object.keys(draft.teams).forEach(teamId => {
            if (!draft.epics.some(epic => epic.teamId === teamId)) {
                delete draft.teams[teamId];
            }
        });
    });
}
