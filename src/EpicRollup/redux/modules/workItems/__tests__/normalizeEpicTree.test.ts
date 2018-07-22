import { createNormalizedEpicTree } from '../workItemSelector';
import { BacklogConfiguration } from 'TFS/Work/Contracts';
declare var test, expect;

const backlogConfiguration: BacklogConfiguration = {
    portfolioBacklogs: [
        { rank: 20, workItemTypes: [{ name: "Feature" }] },
        { rank: 30, workItemTypes: [{ name: "Epic" }] },
        { rank: 40, workItemTypes: [{ name: "Scenario" }] }],
    requirementBacklog: { rank: 10, workItemTypes: [{ name: "User Story" }, { name: "Bug" }] }
} as any;

function getWorkItem(id: number, type: string) {
    return {
        id,
        fields: {
            "System.WorkItemType": type
        }
    }
}

test("validate createNormalizeEpicTree", () => {
    // test empty workitems
    expect(
        createNormalizedEpicTree(
            backlogConfiguration,
            {},
            {
                parentToChildrenMap: {},
                childToParentMap: {}
            }))
        .toEqual({ "childToParentMap": {}, "parentToChildrenMap": { "0": [] } });

    expect(
        createNormalizedEpicTree(
            backlogConfiguration,
            {
                1: getWorkItem(1, "Epic"),
                2: getWorkItem(2, "Feature"),
                3: getWorkItem(3, "User Story")
            } as any,
            {
                parentToChildrenMap: { 0: [1], 1: [2], 2: [3] },
                childToParentMap: { 1: 0, 2: 1, 3: 2 }
            }))
        .toEqual(
            {
                parentToChildrenMap: { 0: [1], 1: [2], 2: [3], 3: [] },
                childToParentMap: { 1: 0, 2: 1, 3: 2 }
            });

    // validate story story hierarchy
    expect(
        createNormalizedEpicTree(
            backlogConfiguration,
            {
                1: getWorkItem(1, "Epic"),
                2: getWorkItem(2, "Feature"),
                3: getWorkItem(3, "User Story"),
                4: getWorkItem(4, "User Story")
            } as any,
            {
                parentToChildrenMap: { 0: [1], 1: [2], 2: [3], 3: [4] },
                childToParentMap: { 1: 0, 2: 1, 3: 2, 4: 3 }
            }))
        .toEqual(
            {
                parentToChildrenMap: { 0: [1], 1: [2], 2: [3, 4], 3: [], 4: [] },
                childToParentMap: { 1: 0, 2: 1, 3: 2, 4: 2 }
            });
});