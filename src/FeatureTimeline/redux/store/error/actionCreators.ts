import { ActionCreator } from 'redux';
import { GenericErrorAction, GenericErrorType } from './actions';

export const genericError: ActionCreator<GenericErrorAction> =
    (error: string) => ({
        type: GenericErrorType,
        payload: error
    });

