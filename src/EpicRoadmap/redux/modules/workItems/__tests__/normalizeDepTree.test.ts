import { IEpicTree } from "../../../selectors/epicTreeSelector";
import { createNormalizedDependencyTree } from "../../../selectors/dependencyTreeSelector";
import { IDependenciesTree } from "../workItemContracts";

declare var test, expect;

test("validate createNormalizedDependencyTree", () => {
    const epicTree: IEpicTree = {
        parentToChildrenMap: {
            0: [1], // epic
            1: [2, 3], // features
            2: [4, 5], // stories
            3: [6, 7] // stories
        },
        childToParentMap: {
            1: 0,
            2: 1,
            3: 1,
            4: 2,
            5: 2,
            6: 3,
            7: 3
        }
    };
    // set cross feature dependency
    const rawDependencyTree: IDependenciesTree = {
        ptos: {
            6: [5]
        },
        stop: {
            5: [6]
        }
    };

    expect(
        createNormalizedDependencyTree(
            epicTree,
            rawDependencyTree))
        .toEqual(
            {
                "allPtos": { 6: [5], 3: [2] },
                "ptos": { 6: [5] },

                "stop": { 5: [6] },
                "allStop": { 5: [6], 2: [3] }
            }
        );
});