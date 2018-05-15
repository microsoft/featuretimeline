import { toggleFeatureState } from "../store/common/actioncreators";
import { put } from "redux-saga/effects";
export const allowPlanFeatures = "allowPlanFeatures";
export function* initializeFeatureState() {
    const enabledFeatures = getFeatureCookies();
    for (const feature of enabledFeatures) {
        yield put(toggleFeatureState(feature.replace("_feature_", ""), true));
    }
}

function getFeatureCookies(): string[] {
    debugger;
    const features = [];
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies: string[] = decodedCookie.split(';');
    for (const cookie of cookies) {
        const parts = cookie.trim().split('=');
        const name = parts[0];
        if (name.indexOf("_feature_") >= 0 && parts[1] === "true") {
            features.push(name);
        }
    }
    return features;
}