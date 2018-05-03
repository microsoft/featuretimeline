import { Middleware } from "redux";

export const trackActions: Middleware = api => next => action => {
    //if (action["track"]) 
    {
        // TODO: Publish telemetry
        // console.log("TELEMETRY: ", action);
    }
    return next(action);
};

