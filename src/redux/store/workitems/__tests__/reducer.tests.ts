declare var it, expect;

import reducer from '../reducer';
import { workItemsReceived, replaceWorkItems } from '../actionCreators';
debugger;
it('test work item received', () => {
    debugger;
    const action = workItemsReceived([{
        id: 1
    }], [], [1], [])
    const state = reducer({workItemInfos: {}}, action);
    expect(state).toMatchSnapshot();
});

it('work item updated', () => {
    const action = workItemsReceived([{
        id: 1,
        fields: {
            "System.Title": "hello"
        }
    }], [], [2], []);

    let state = reducer({workItemInfos: {}}, action);
    expect(state).toMatchSnapshot();

    const replaceAction = replaceWorkItems([{
        id: 1,
        fields: {
            "System.Title": "hi"
        }

    }])
    state = reducer(state, replaceAction);
    expect(state).toMatchSnapshot();
});

