import { ActionCreator } from 'redux';
import { LoadingAction, LoadingType } from './actions';

export const loading: ActionCreator<LoadingAction> =
    (status: boolean) => ({
        type: LoadingType,
        payload: status
    });

