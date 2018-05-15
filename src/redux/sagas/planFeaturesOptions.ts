import { call, select } from 'redux-saga/effects';
import { proposedWorkItemPaneSelector } from '../selectors';

export function* savePlanFeatures() {
    let value = yield select(proposedWorkItemPaneSelector());
    const dataService = yield call(VSS.getService, VSS.ServiceIds.ExtensionData);

    value = value ? "true": null;
    yield call([dataService, dataService.setValue], `showPlanFeatures`, value, { scopeType: 'User' });
}