import { Action } from "redux";

type ActionsCreatorsMapObject = {
    [actionCreator: string]: (...args: any[]) => any;
};
export type ActionsUnion<A extends ActionsCreatorsMapObject> = ReturnType<A[keyof A]>;
export type ActionsOfType<ActionUnion, ActionType extends string> = ActionUnion extends Action<ActionType>
    ? ActionUnion
    : never;

// tslint:disable-next-line:interface-name
export interface ActionWithPayload<T extends string, P> extends Action<T> {
    /**
     * The payload of this action
     */
    payload: P;
}

export function createAction<T extends string>(type: T): Action<T>;
export function createAction<T extends string, P>(
    type: T,
    payload: P,
    meta?: IDictionaryStringTo<string>
): ActionWithPayload<T, P>;
// tslint:disable-next-line:typedef
export function createAction<T extends string, P>(type: T, payload?: P, meta?: IDictionaryStringTo<string>) {
    return { type, payload, meta };
}
