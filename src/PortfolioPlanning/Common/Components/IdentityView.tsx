import * as React from "react";
import "./IdentityView.scss";
import { VssPersona, VssPersonaSize } from "azure-devops-ui/VssPersona";
import { isIdentityRef, parseUniquefiedIdentityName } from "../Utilities/Identity";
import { IdentityRef } from "VSS/WebApi/Contracts";

export interface IIdentityViewProps {
    className?: string;
    value: IdentityRef | string;
    size?: VssPersonaSize;
}

export const IdentityView = (props: IIdentityViewProps): JSX.Element => {
    const { value } = props;
    let identityRef: IdentityRef;

    if (!isIdentityRef(value)) {
        identityRef = parseUniquefiedIdentityName(value);
    } else {
        identityRef = value;
    }

    if (!identityRef || !identityRef.displayName) {
        return null;
    }

    return (
        <div className={props.className}>
            <VssPersona
                className="identity-view"
                size={props.size || "medium"}
                identityDetailsProvider={{
                    getDisplayName: () => identityRef.displayName,
                    getIdentityImageUrl: () => identityRef.imageUrl
                }}
            />
            <div className="display-name">{identityRef.displayName}</div>
        </div>
    );
};
