import { createRawEpicTree } from "../selectors/epicTreeSelector";
import { WorkItemLink } from 'TFS/WorkItemTracking/Contracts';
declare var test, expect;
function wit(id: number) {
    return {
        id,
        url: ""
    }
}

function parentChild(source: number, target: number) {
    return {
        rel: "", source: wit(source), target: wit(target)
    }
}

test("validate createRawEpicTree", () => {
    // Test empty links
    let links: WorkItemLink[] = [];
    expect(createRawEpicTree(links)).toEqual({
        childToParentMap: {},
        parentToChildrenMap: {}
    });

    // test links with no children
    links = [parentChild(0, 1)];
    expect(createRawEpicTree(links)).toEqual({
        childToParentMap: { 1: 0 },
        parentToChildrenMap: { 0: [1] }
    });

    // test links with two level of children
    links = [parentChild(0, 1),
    parentChild(1, 2),
    parentChild(2, 4),
    parentChild(2, 3)];

    expect(createRawEpicTree(links)).toEqual({
        childToParentMap: { 4: 2, 3: 2, 2: 1, 1: 0 },
        parentToChildrenMap: { 0: [1], 1: [2], 2: [4, 3] }
    });
});