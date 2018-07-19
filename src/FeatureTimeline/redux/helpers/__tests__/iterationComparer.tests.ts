import { getCurrentIterationIndex } from "../iterationComparer";
import { TeamSettingsIteration } from "TFS/Work/Contracts";
declare var it, expect;

it('test get current iteration', () => {
    const curentNow = Date.now;
    (Date.now as any) = (() => new Date(2018, 4, 3));
    console.log("now is ", Date.now());
    expect(iterations[getCurrentIterationIndex(iterations)].attributes).toMatchSnapshot();

    (Date.now as any) = (() => new Date(2018, 3, 3));
    console.log("now is ", Date.now());
    expect(iterations[getCurrentIterationIndex(iterations)].attributes).toMatchSnapshot();
    
    Date.now = curentNow;
});

const iterations = [
    {
        "id": "7a024609-54c0-424f-8c49-baa3e90770a3",
        "name": "Iteration 019",
        "path": "RootIteration.CAD\\PDM\\Iteration 019",
        "attributes": {
            "startDate": new Date("2017-04-04T00:00:00Z"),
            "finishDate": new Date("2017-04-17T00:00:00Z")
        },
        "url": ""
    }, {
        "id": "29a6f418-4728-422f-aa78-3c8dbf21964f",
        "name": "Iteration 020",
        "path": "RootIteration.CAD\\PDM\\Iteration 020",
        "attributes": {
            "startDate": new Date("2017-04-18T00:00:00Z"),
            "finishDate": new Date("2017-05-01T00:00:00Z")
        },
        "url": ""
    }, {
        "id": "03002bcb-df74-49d9-bf88-daf180a9319e",
        "name": "Iteration 021",
        "path": "RootIteration.CAD\\PDM\\Iteration 021",
        "attributes": {
            "startDate": new Date("2017-05-02T00:00:00Z"),
            "finishDate": new Date("2017-05-15T00:00:00Z")
        },
        "url": ""
    }, {
        "id": "156e7aa1-a621-4494-bfa5-e741f194d3d5",
        "name": "Iteration 022",
        "path": "RootIteration.CAD\\PDM\\Iteration 022",
        "attributes": {
            "startDate": new Date("2017-05-16T00:00:00Z"),
            "finishDate": new Date("2017-05-29T00:00:00Z")
        },
        "url": ""
    }, {
        "id": "b01f1587-2beb-4898-9c0f-64a4a2b8bfa5",
        "name": "Iteration 023",
        "path": "RootIteration.CAD\\PDM\\Iteration 023",
        "attributes": {
            "startDate": new Date("2017-05-30T00:00:00Z"),
            "finishDate": new Date("2017-06-12T00:00:00Z")
        },
        "url": ""
    }, {
        "id": "6cfc2132-6d14-4917-9172-acb6e6068223",
        "name": "Iteration 024",
        "path": "RootIteration.CAD\\PDM\\Iteration 024",
        "attributes": {
            "startDate": new Date("2017-06-13T00:00:00Z"),
            "finishDate": new Date("2017-06-26T00:00:00Z")
        },
        "url": ""
    }, {
        "id": "e239255b-6bec-4735-9f22-855e24496fd0",
        "name": "Iteration 025",
        "path": "RootIteration.CAD\\PDM\\Iteration 025",
        "attributes": {
            "startDate": new Date("2017-06-27T00:00:00Z"),
            "finishDate": new Date("2017-07-10T00:00:00Z")
        },
        "url": ""
    }, {
        "id": "72a3b5d6-83e5-4ede-b041-b8484cd7a650",
        "name": "Iteration 026",
        "path": "RootIteration.CAD\\PDM\\Iteration 026",
        "attributes": {
            "startDate": new Date("2017-07-11T00:00:00Z"),
            "finishDate": new Date("2017-07-24T00:00:00Z")
        },
        "url": ""
    }, {
        "id": "4dfe8fb7-734d-4087-ac02-52c85fd05407",
        "name": "Iteration 027",
        "path": "RootIteration.CAD\\PDM\\Iteration 027",
        "attributes": {
            "startDate": new Date("2017-07-25T00:00:00Z"),
            "finishDate": new Date("2017-08-07T00:00:00Z")
        },
        "url": ""
    }, {
        "id": "af6fe61e-0323-4e26-92b4-6114e8aeb12b",
        "name": "Iteration 028",
        "path": "RootIteration.CAD\\PDM\\Iteration 028",
        "attributes": {
            "startDate": new Date("2017-08-08T00:00:00Z"),
            "finishDate": new Date("2017-08-21T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/af6fe61e-0323-4e26-92b4-6114e8aeb12b"
    }, {
        "id": "f5bf4b93-50a6-4761-991b-5b9c8ddc8638",
        "name": "Iteration 029",
        "path": "RootIteration.CAD\\PDM\\Iteration 029",
        "attributes": {
            "startDate": new Date("2017-08-22T00:00:00Z"),
            "finishDate": new Date("2017-09-04T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/f5bf4b93-50a6-4761-991b-5b9c8ddc8638"
    }, {
        "id": "de1e7873-246f-4ba6-91c4-5fc511a4b6d9",
        "name": "Iteration 030",
        "path": "RootIteration.CAD\\PDM\\Iteration 030",
        "attributes": {
            "startDate": new Date("2017-09-05T00:00:00Z"),
            "finishDate": new Date("2017-09-18T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/de1e7873-246f-4ba6-91c4-5fc511a4b6d9"
    }, {
        "id": "5b956683-3405-4b8a-b5b0-ae324b98a5ed",
        "name": "Iteration 031",
        "path": "RootIteration.CAD\\PDM\\Iteration 031",
        "attributes": {
            "startDate": new Date("2017-09-19T00:00:00Z"),
            "finishDate": new Date("2017-10-02T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/5b956683-3405-4b8a-b5b0-ae324b98a5ed"
    }, {
        "id": "b33db907-b085-49e5-b817-677026ae416f",
        "name": "Iteration 032",
        "path": "RootIteration.CAD\\PDM\\Iteration 032",
        "attributes": {
            "startDate": new Date("2017-10-03T00:00:00Z"),
            "finishDate": new Date("2017-10-16T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/b33db907-b085-49e5-b817-677026ae416f"
    }, {
        "id": "a57a3582-8dee-4987-8984-450dbb0b9928",
        "name": "Iteration 033",
        "path": "RootIteration.CAD\\PDM\\Iteration 033",
        "attributes": {
            "startDate": new Date("2017-10-17T00:00:00Z"),
            "finishDate": new Date("2017-10-30T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/a57a3582-8dee-4987-8984-450dbb0b9928"
    }, {
        "id": "efc24480-c87f-4838-8761-eb3b3d650775",
        "name": "Iteration 034",
        "path": "RootIteration.CAD\\PDM\\Iteration 034",
        "attributes": {
            "startDate": new Date("2017-10-31T00:00:00Z"),
            "finishDate": new Date("2017-11-13T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/efc24480-c87f-4838-8761-eb3b3d650775"
    }, {
        "id": "4d448ea6-6fba-4fd1-b448-2d4176d5d44f",
        "name": "Iteration 035",
        "path": "RootIteration.CAD\\PDM\\Iteration 035",
        "attributes": {
            "startDate": new Date("2017-11-14T00:00:00Z"),
            "finishDate": new Date("2017-11-27T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/4d448ea6-6fba-4fd1-b448-2d4176d5d44f"
    }, {
        "id": "d7265473-083f-49e5-b51e-1bfc2592b951",
        "name": "Iteration 036",
        "path": "RootIteration.CAD\\PDM\\Iteration 036",
        "attributes": {
            "startDate": new Date("2017-11-28T00:00:00Z"),
            "finishDate": new Date("2017-12-11T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/d7265473-083f-49e5-b51e-1bfc2592b951"
    }, {
        "id": "5e839055-0640-4d8b-9440-ed2a1dc42263",
        "name": "Iteration 037",
        "path": "RootIteration.CAD\\PDM\\Iteration 037",
        "attributes": {
            "startDate": new Date("2017-12-12T00:00:00Z"),
            "finishDate": new Date("2017-12-25T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/5e839055-0640-4d8b-9440-ed2a1dc42263"
    }, {
        "id": "cb55ed8f-57e1-4369-8368-7394d325fb82",
        "name": "Iteration 038",
        "path": "RootIteration.CAD\\PDM\\Iteration 038",
        "attributes": {
            "startDate": new Date("2018-01-02T00:00:00Z"),
            "finishDate": new Date("2018-01-15T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/cb55ed8f-57e1-4369-8368-7394d325fb82"
    }, {
        "id": "0b0efe4a-b1ae-4a0b-92eb-7a0858ae2000",
        "name": "Iteration 039",
        "path": "RootIteration.CAD\\PDM\\Iteration 039",
        "attributes": {
            "startDate": new Date("2018-01-16T00:00:00Z"),
            "finishDate": new Date("2018-01-29T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/0b0efe4a-b1ae-4a0b-92eb-7a0858ae2000"
    }, {
        "id": "efbb0b3a-2a02-4a9c-87ab-de56bb5ae88f",
        "name": "Iteration 040",
        "path": "RootIteration.CAD\\PDM\\Iteration 040",
        "attributes": {
            "startDate": new Date("2018-01-30T00:00:00Z"),
            "finishDate": new Date("2018-02-12T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/efbb0b3a-2a02-4a9c-87ab-de56bb5ae88f"
    }, {
        "id": "4c69ead5-61a4-47db-a84c-9410f95f5a93",
        "name": "Iteration 041",
        "path": "RootIteration.CAD\\PDM\\Iteration 041",
        "attributes": {
            "startDate": new Date("2018-02-13T00:00:00Z"),
            "finishDate": new Date("2018-02-26T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/4c69ead5-61a4-47db-a84c-9410f95f5a93"
    }, {
        "id": "bc63e84b-b91e-4596-9e97-548857fb6f0b",
        "name": "Iteration 042",
        "path": "RootIteration.CAD\\PDM\\Iteration 042",
        "attributes": {
            "startDate": new Date("2018-02-27T00:00:00Z"),
            "finishDate": new Date("2018-03-12T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/bc63e84b-b91e-4596-9e97-548857fb6f0b"
    }, {
        "id": "aa55c57f-9a76-4119-b08c-c5ae793b8bf3",
        "name": "Iteration 043",
        "path": "RootIteration.CAD\\PDM\\Iteration 043",
        "attributes": {
            "startDate": new Date("2018-03-13T00:00:00Z"),
            "finishDate": new Date("2018-03-26T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/aa55c57f-9a76-4119-b08c-c5ae793b8bf3"
    }, {
        "id": "997a777c-3b7b-416e-9e7f-9875b71cd1cf",
        "name": "Iteration 044",
        "path": "RootIteration.CAD\\PDM\\Iteration 044",
        "attributes": {
            "startDate": new Date("2018-03-27T00:00:00Z"),
            "finishDate": new Date("2018-04-09T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/997a777c-3b7b-416e-9e7f-9875b71cd1cf"
    }, {
        "id": "b08e2420-1ae8-4293-bced-fce8dde442b5",
        "name": "Iteration 045",
        "path": "RootIteration.CAD\\PDM\\Iteration 045",
        "attributes": {
            "startDate": new Date("2018-04-10T00:00:00Z"),
            "finishDate": new Date("2018-04-23T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/b08e2420-1ae8-4293-bced-fce8dde442b5"
    }, {
        "id": "43df588a-e28f-48c6-8a63-1c7b95757c53",
        "name": "Iteration 046",
        "path": "RootIteration.CAD\\PDM\\Iteration 046",
        "attributes": {
            "startDate": new Date("2018-04-24T00:00:00Z"),
            "finishDate": new Date("2018-05-07T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/43df588a-e28f-48c6-8a63-1c7b95757c53"
    }, {
        "id": "d8f2c120-0244-4d8b-8bd1-a9d722378020",
        "name": "Iteration 047",
        "path": "RootIteration.CAD\\PDM\\Iteration 047",
        "attributes": {
            "startDate": new Date("2018-05-08T00:00:00Z"),
            "finishDate": new Date("2018-05-22T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/d8f2c120-0244-4d8b-8bd1-a9d722378020"
    }, {
        "id": "d34b167c-5bcd-4257-849e-83af70c27a43",
        "name": "Go-Live A3",
        "path": "RootIteration.CAD\\PDM\\Go-Live A3",
        "attributes": {
            "startDate": new Date("2018-08-01T00:00:00Z"),
            "finishDate": new Date("2018-08-01T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/d34b167c-5bcd-4257-849e-83af70c27a43"
    }, {
        "id": "1af0490c-3544-4e25-98c4-831914958c73",
        "name": "Go-Live MUMI",
        "path": "RootIteration.CAD\\PDM\\Go-Live MUMI",
        "attributes": {
            "startDate": new Date("2018-09-02T00:00:00Z"),
            "finishDate": new Date("2018-09-02T00:00:00Z")
        },
        "url": "http://host:8080/tfs/Project/00000000-61c8-4b59-9670-fa683959037e/abdcced8-eda5-43ab-9eb8-7591134c72e9/_apis/work/teamsettings/iterations/1af0490c-3544-4e25-98c4-831914958c73"
    }
] as TeamSettingsIteration[];