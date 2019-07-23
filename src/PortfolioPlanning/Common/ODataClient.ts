import { authTokenManager } from "VSS/Authentication/Services";
import { GUIDUtil } from "./Utilities/GUIDUtil";
/// <reference types='jquery' />
/// <reference types='jqueryui' />

/**Responsiblities:
 * 1-Provides methods for determining Analytics Service OData endpoint address.
 * 2-Constructs OData HTTP requests via GET and POST method
 *
 * Note: VSTS Reporting team intends to provide a generated OData Client API from Analytics service, on a similar pattern to VSTS REST API's,
 * however client generation for OData is not a ready capability at the time this sample was authored.
 **/
export class ODataClient {
    private static instance: IPromise<ODataClient> = null;
    private authToken: string;
    private static oDataVersion = "v3.0-preview"; // 3.0-preview supports Descendants
    public static valueKey = "value";

    private constructor(authToken: string) {
        this.authToken = authToken;
    }

    /**
     * Get or create promise to a shared Instance of client, initialized with VSS Auth token.
     */
    public static getInstance(): IPromise<ODataClient> {
        if (ODataClient.instance) {
            return ODataClient.instance;
        } else {
            ODataClient.instance = VSS.getAccessToken().then(token => {
                let authToken = authTokenManager.getAuthorizationHeader(token);
                return new ODataClient(authToken);
            });
            return ODataClient.instance;
        }
    }

    public getODataEndpoint(accountName: string, projectName: string): string {
        const projectSegment = projectName != null ? `${projectName}/` : "";

        //  HACK:  local onprem deployment endpoint
        return `http://localhost/defaultcollection/${projectSegment}_odata/${ODataClient.oDataVersion}/`;
    }

    private constructJsonRequest(authToken: string, type: string, url: string): JQueryAjaxSettings {
        return {
            type: type,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", authToken);
            }
        };
    }

    private constructXmlRequest(authToken: string, type: string, url: string): JQueryAjaxSettings {
        return {
            type: type,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "xml",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", authToken);
            }
        };
    }

    /* Generates an account scoped odata url, which spans across projects.*/
    public generateAccountLink(oDataQuery: string) {
        var accountName = VSS.getWebContext().account.name;
        return this.getODataEndpoint(accountName, null) + oDataQuery;
    }

    /**
     * Generates an OData url scoped to the specified project name or guid
     */
    public generateProjectLink(project: string, oDataQuery: string) {
        var accountName = VSS.getWebContext().account.name;
        return this.getODataEndpoint(accountName, project) + oDataQuery;
    }

    /**
     * Generates an OData url scoped to the current project
     */
    public generateCurrentProjectLink(oDataQuery: string) {
        var accountName = VSS.getWebContext().account.name;
        var project = VSS.getWebContext().project.name;
        return this.getODataEndpoint(accountName, project) + oDataQuery;
    }

    /**
     * OData traditional OData GET Queries is fine for common/simple queries, less than ~4k long.
     */
    public runGetQuery(fullQueryUrl: string): IPromise<any> {
        return $.ajax(this.constructJsonRequest(this.authToken, "GET", fullQueryUrl));
    }

    /**
     * OData POST Query is neccessary for long queries, particularly user config-driven options which can entail long lists of params.
     */
    public runPostQuery(fullQueryUrl: string): IPromise<any> {
        let contentRequest = this.constructJsonRequest(this.authToken, "POST", this.generateAccountLink("$batch"));

        let batchIdentifier = GUIDUtil.newGuid();
        contentRequest.data = this.generateODataPostPayload(fullQueryUrl, batchIdentifier);
        contentRequest.processData = false; // payload is already a string
        contentRequest.headers = {
            "Content-Type": `multipart/mixed; boundary=batch_${batchIdentifier}`,
            Accept: `text/plain;api-version=${ODataClient.oDataVersion}`
        };

        //  TODO    Hack, sending JSON type in request causes parsing error, xhr tries to parse it as JSON, but since it has the
        //          batch boundaries, parsing fails.
        contentRequest.dataType = undefined;

        return $.ajax(contentRequest);
    }

    /**
     * Generates an OData Payload, acccording to OData POST/Batch contract. Note, this only supplies a single request
     * @param getUrl The long-form URL for the request
     * @param batchIdentifier Unique identifier of this batch request
     */
    private generateODataPostPayload(getUrl: string, batchIdentifier: string): string {
        let newLine = "\n";
        return (
            `--batch_${batchIdentifier}` +
            newLine +
            "Content-Type: application/http" +
            newLine +
            "Content-Transfer-Encoding: binary" +
            newLine +
            newLine +
            `GET ${getUrl} HTTP/1.1` +
            newLine +
            newLine +
            `--batch_${batchIdentifier}`
        );
    }

    /**
     * Handles Requests for Metadata Queries on Entities.
     */
    public runMetadataQuery(projectName: string): IPromise<any> {
        return $.ajax(
            this.constructXmlRequest(this.authToken, "GET", this.generateProjectLink(projectName, "$metadata"))
        );
    }

    public runMetadataWorkItemReferenceNameQuery(referenceName: string): IPromise<string> {
        return this.runMetadataQuery(undefined).then(rawXml => {
            //  All of this because IE doesn't support Xpath evaluate :(
            const analyticsModels = Array.from<HTMLElement>(
                rawXml.documentElement.getElementsByTagName("Schema")
            ).filter(s =>
                this.compareAttributeValue(s, "Namespace", "Microsoft.VisualStudio.Services.Analytics.Model")
            );

            if (analyticsModels && analyticsModels.length === 1) {
                const entityTypes = Array.from<Element>(analyticsModels[0].getElementsByTagName("EntityType")).filter(
                    e => this.compareAttributeValue(e, "Name", "WorkItem")
                );

                if (entityTypes && entityTypes.length === 1) {
                    const workItems = Array.from<Element>(entityTypes[0].getElementsByTagName("Annotation")).filter(
                        annotation =>
                            this.compareAttributeValue(annotation, "Term", "Ref.ReferenceName") &&
                            this.compareAttributeValue(annotation, "String", referenceName)
                    );

                    if (workItems && workItems.length === 1) {
                        const fieldProperty: HTMLElement = workItems[0].parentElement;

                        //  Verify this is the node we are looking for.
                        if (fieldProperty.tagName.toLowerCase() === "property") {
                            return fieldProperty.getAttribute("Name");
                        }
                    }
                }
            }
        });
    }

    private compareAttributeValue(element: Element, attributeName: string, expectedValue: string): boolean {
        if (!element) {
            return false;
        }

        const observedAttrValue = element.getAttribute(attributeName);

        if (observedAttrValue) {
            return observedAttrValue.toLowerCase() === expectedValue.toLowerCase();
        }

        return false;
    }
}
