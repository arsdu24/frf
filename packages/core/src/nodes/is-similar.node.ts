import {JSXNode} from "../types";
import {isJSXNode} from "../helpers";

export function isSimilar(a: JSXNode, b: JSXNode): boolean {
    if (!isJSXNode(a) || !isJSXNode(b) || a.nodeName !== b.nodeName) {
        return false
    }

    const aKeys: string[] = Object.keys(a.propsMetadata);
    const bKeys: string[] = Object.keys(b.propsMetadata);
    const distinctKeys: Set<string> = new Set([...aKeys, ...bKeys]);

    if (Object.keys(a.propsMetadata).length !== Object.keys(b.propsMetadata).length) {
        return false
    }

    return ![...distinctKeys.keys()].some(key => a.propsMetadata[key] !== b.propsMetadata[key])
}
