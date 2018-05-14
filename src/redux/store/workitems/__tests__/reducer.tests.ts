declare var it, expect;

import reducer from '../reducer';
import { workItemsReceived } from '../actionCreators';
debugger;
it('test work item received', () => {
    debugger;
    const action = workItemsReceived([{
        id: 1
    }], [], [1], [])
    const state = reducer({workItemInfos: {}}, action);
    expect(state).toMatchSnapshot();
});