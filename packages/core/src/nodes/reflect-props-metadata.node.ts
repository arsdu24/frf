import {JSXNodePropsMetadata, JSXNodePropsMetadataType, O} from "../types";
import {isJSXNode, isObservable} from "../helpers";

export function reflectPropsMetadata(props: O): JSXNodePropsMetadata {
    return Object.entries(props).reduce((meta: JSXNodePropsMetadata, [key, value]) => {
        let type: JSXNodePropsMetadataType = 'text';

        if (isObservable(value)) {
            type = 'stream';
        }

        if (isJSXNode(value)) {
            type = 'node';
        }

        return {...meta, [key]: type};
    }, {})
}
