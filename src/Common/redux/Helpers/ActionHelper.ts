import { Action } from "redux";
import { IDictionaryStringTo } from "../Contracts/types";

/**
 * A better typing for the Redux Action
 */
// tslint:disable-next-line:interface-name
export interface ActionWithPayload<T extends string, P> extends Action<T> {
    /**
     * The payload of this action
     */
    payload: P;
}

/**
 * Create a new action with type and payload
 * @param type The action type
 * @param payload The payload
 */
export function createAction<T extends string>(type: T): Action<T>;
export function createAction<T extends string, P>(type: T, payload: P, meta?: IDictionaryStringTo<string>): ActionWithPayload<T, P>;
// tslint:disable-next-line:typedef
export function createAction<T extends string, P>(type: T, payload?: P, meta?: IDictionaryStringTo<string>) {
    return { type, payload, meta };
}

type ActionsCreatorsMapObject = { [actionCreator: string]: (...args: any[]) => any };
export type ActionsUnion<A extends ActionsCreatorsMapObject> = ReturnType<A[keyof A]>;