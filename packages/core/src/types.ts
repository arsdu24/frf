import {Observable} from "rxjs";
import {Omit} from "type-fest";

export type O = object;

export type HostNode = { isHost: boolean; props: O; content: JSXNode[] }
export type JSXNodePropsMetadataType = 'text' | 'stream' | 'node';
export type JSXNodePropsMetadata = Record<string, JSXNodePropsMetadataType>;

export interface JSXNode extends Node {
    handleProps<T extends O>(props: Observable<T>): void;
    isLikeYou(like: JSXNode): boolean;
    propsMetadata: JSXNodePropsMetadata;
    readonly props$: Observable<{ content: JSXNode[] } & Record<string, unknown>>
}

export type JSXNodeFacade = Omit<JSXNode, keyof Node>;

export interface JSXNodeFactory {
    new <T extends O>(props?: Observable<T>): JSXNode;
}

export type JSXNodeType = 'host' | keyof HTMLElementTagNameMap | Function
export type JSXContent = string | boolean | number | symbol | Function | Array<any> | object | Date | Observable<any> | JSXNode | JSXNode[];
export type JSXNodePropsDefinition = { name: string; type: JSXNodePropsType; };
export type JSXNodePropsType = 'string' | 'boolean' | 'number' | 'bigint' | 'undefined' | 'symbol' | 'function' | 'array' | 'object' | 'date' | 'stream' | 'NODE';


export type ComponentProps<T extends O> = FlattenProps<T> & {
    [k in keyof T as `${string & k}$`]: Observable<T[k] extends Observable<infer R> ? R : T[k]>;
} & {
    content: JSXNode[];
    $: Observable<FlattenProps<T>>
}
export type FlattenProps<T extends O> = {
    [k in keyof T]: T[k] extends Observable<infer R> ? R : T[k];
}
export type AllowedProps<T extends O> = {
    [k in keyof T]: T[k] | (T[k] extends Observable<infer R> ? R : Observable<T[k]>);
}
export type ComponentRenderer<T extends O> = (props: ComponentProps<T>) => JSXNode;
export type Component<T extends O> = {
    (props: AllowedProps<T>): JSXNode;
    readonly name: string;
    mapProps<P extends O>(controller: (props: ComponentProps<P>) => AllowedProps<T> | Observable<T>): Component<P>;
}
