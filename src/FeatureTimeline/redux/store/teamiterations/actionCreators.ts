import { ActionCreator } from 'redux';
import { TeamSettingsIterationReceivedAction, TeamSettingsIterationReceivedType, DisplayAllIterationsAction, DisplayAllIterationsActionType, ChangeDisplayIterationCountAction, ChangeDisplayIterationCountActionType, ShiftDisplayIterationLeftActionType, ShiftDisplayIterationLeftAction, ShiftDisplayIterationRightActionType, ShiftDisplayIterationRightAction, RestoreDisplayIterationCountAction, RestoreDisplayIterationCountActionType } from './actions';
import { TeamSettingsIteration } from 'TFS/Work/Contracts';
import { IIterationDisplayOptions } from './types';

export const teamSettingsIterationReceived: ActionCreator<TeamSettingsIterationReceivedAction> =
    (projectId: string, teamId: string, TeamSettingsIterations: TeamSettingsIteration[]) => ({
        type: TeamSettingsIterationReceivedType,
        payload: {
            projectId,
            teamId,
            TeamSettingsIterations
        }
    });

export const displayAllIterations: ActionCreator<DisplayAllIterationsAction> =
    () => ({
        type: DisplayAllIterationsActionType,
        payload: null
    });

export const changeDisplayIterationCount: ActionCreator<ChangeDisplayIterationCountAction> =
    (count: number, projectId: string, teamId: string) => ({
        type: ChangeDisplayIterationCountActionType,
        payload: {
            count,
            projectId,
            teamId
        }
    });

export const restoreDisplayIterationCount: ActionCreator<RestoreDisplayIterationCountAction> =
    (payload: IIterationDisplayOptions) => ({
        type: RestoreDisplayIterationCountActionType,
        payload
    });

export const shiftDisplayIterationLeft: ActionCreator<ShiftDisplayIterationLeftAction> =
    (count: number) => ({
        type: ShiftDisplayIterationLeftActionType,
        payload: {
            count,
        }
    });

export const shiftDisplayIterationRight: ActionCreator<ShiftDisplayIterationRightAction> =
    (count: number) => ({
        type: ShiftDisplayIterationRightActionType,
        payload: {
            count,
        }
    });