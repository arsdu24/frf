import {Observable, isObservable as isObservableRx} from "rxjs";
import {JSXNode} from "../types";

export function isJSXNode(node: unknown): node is JSXNode {
    const hasProp = (key: string, type: string) => node && typeof node[key] === type;

    return hasProp('nodeName', 'string')
        && hasProp('propsMetadata', 'object')
        && hasProp('handleProps', 'function')
        && hasProp('isLikeYou', 'function')
}

export function isObservable<T>(stream: unknown): stream is Observable<T> {
    return isObservableRx(stream);
}
