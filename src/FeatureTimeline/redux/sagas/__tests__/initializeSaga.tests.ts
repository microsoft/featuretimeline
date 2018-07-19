declare var it, expect;

import { callInitialize } from '../initializeFeatureTimeline';
import { createInitialize } from '../../store/common/actioncreators';

it('test initialize saga basic test', () => {
    const initializeAction = createInitialize("projectId", "teamId", "backlogLevel");
    const saga = callInitialize(initializeAction);

    // Expect loading true
    expect(saga.next()).toMatchSnapshot();

    // Expect call to initialize saga
    expect(saga.next()).toMatchSnapshot();

    // Expect loading false
    expect(saga.next()).toMatchSnapshot();

    // Expect null
    expect(saga.next()).toMatchSnapshot();
});
