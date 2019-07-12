import { GUIDUtil } from "./GUIDUtil";
import { isNullOrWhiteSpace, startsWith } from "../Utilities/String";
import { IdentityRef } from "VSS/WebApi/Contracts";

export function isIdentityRef(value: any): value is IdentityRef {
    return !!(value && value.displayName !== undefined);
}

export function getCurrentUserName(): string {
    const currentUser = VSS.getWebContext().user;
    return `${currentUser.name} <${currentUser.uniqueName || ""}>`;
}

export function getCurrentUser(): IdentityRef {
    const currentUser = VSS.getWebContext().user;
    const imageUrl = buildAvatarUrl(currentUser.id);
    return {
        id: currentUser.id,
        displayName: currentUser.name,
        uniqueName: currentUser.uniqueName || currentUser.email,
        imageUrl: imageUrl,
        _links: {
            avatar: {
                href: imageUrl
            }
        }
    } as IdentityRef;
}

export function getDistinctNameFromIdentityRef(identityRef: IdentityRef): string {
    if (identityRef == null) {
        return "";
    }

    const displayName = identityRef.displayName;
    const uniqueName = identityRef.uniqueName;

    if (uniqueName) {
        return `${displayName} <${uniqueName}>`;
    } else {
        return displayName;
    }
}

export function parseUniquefiedIdentityName(distinctName: string): IdentityRef {
    if (isNullOrWhiteSpace(distinctName)) {
        return {
            id: null,
            displayName: null,
            uniqueName: null,
            imageUrl: null
        } as IdentityRef;
    }

    const i = distinctName.lastIndexOf("<");
    const j = distinctName.lastIndexOf(">");
    let displayName = distinctName;
    let uniqueName: string;
    let id: string;

    if (i >= 0 && j > i && j === distinctName.length - 1) {
        displayName = distinctName.substr(0, i).trim();
        const rightPart = distinctName.substr(i + 1, j - i - 1).trim();
        const vsIdFromAlias: string = getVsIdFromGroupUniqueName(rightPart); // if it has vsid in unique name (for TFS groups)

        if (
            rightPart.indexOf("@") !== -1 ||
            rightPart.indexOf("\\") !== -1 ||
            vsIdFromAlias ||
            GUIDUtil.isGuid(rightPart)
        ) {
            // if its a valid alias
            uniqueName = rightPart;

            // If the alias component is just a guid then this is not a uniqueName but
            // vsId which is used only for TFS groups
            if (!isNullOrWhiteSpace(vsIdFromAlias)) {
                id = vsIdFromAlias;
                uniqueName = null;
            }
        } else {
            // if its not a valid alias, treat it as a non-identity string
            displayName = distinctName;
        }
    }

    return {
        id: id,
        displayName: displayName,
        uniqueName: uniqueName,
        imageUrl: buildAvatarUrl(id, uniqueName)
    } as IdentityRef;
}

export function buildAvatarUrl(id?: string, uniqueName?: string, descriptor?: string): string {
    const hostUri = VSS.getWebContext().host.uri;

    if (!isNullOrWhiteSpace(descriptor)) {
        return `${hostUri}/_apis/GraphProfile/MemberAvatars/${descriptor}`;
    } else if (!isNullOrWhiteSpace(id)) {
        return `${hostUri}/_api/_common/IdentityImage?id=${id}`;
    } else if (!isNullOrWhiteSpace(uniqueName)) {
        return `${hostUri}/_api/_common/IdentityImage?identifier=${uniqueName}&identifierType=0`;
    }

    return null;
}

export function getAvatarUrl(identityRef: IdentityRef): string {
    const avatarUrl = identityRef._links && identityRef._links.avatar && identityRef._links.avatar.href;
    return (
        avatarUrl ||
        identityRef.imageUrl ||
        buildAvatarUrl(identityRef.id, identityRef.uniqueName, identityRef.descriptor)
    );
}

function getVsIdFromGroupUniqueName(str: string): string {
    let leftPart: string;
    if (isNullOrWhiteSpace(str)) {
        return null;
    }

    let vsid = null;
    const i = str.lastIndexOf("\\");
    if (i === -1) {
        leftPart = str;
    } else {
        leftPart = str.substr(0, i);
    }

    if (startsWith(leftPart, "id:")) {
        const rightPart = leftPart.substr(3).trim();
        vsid = GUIDUtil.isGuid(rightPart) ? rightPart : "";
    }

    return vsid;
}
