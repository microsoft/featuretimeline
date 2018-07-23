import { createRawDependencyTree } from '../selectors/dependencyTreeSelector';
import { WorkItemLink } from 'TFS/WorkItemTracking/Contracts';
declare var test, expect;
function wit(id: number) {
    return {
        id,
        url: ""
    }
}

function successorPredecessor(source: number, target: number) {
    return {
        rel: "", source: wit(source), target: wit(target)
    }
}

test("validate createRawDependencyTree", () => {
    // Test empty links
    let links: WorkItemLink[] = [];
    expect(createRawDependencyTree(links))
        .toEqual({
            ptos: {},
            stop: {}
        });

    links = [
        successorPredecessor(1, 2),
        successorPredecessor(3, 2),
        successorPredecessor(4, 3)];
    expect(createRawDependencyTree(links)).toEqual({
        ptos: { 2: [1, 3], 3: [4] },
        stop: { 1: [2], 3: [2], 4: [3] }
    });
});