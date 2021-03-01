import {ConnectableObservable, Observable, Subscription} from "rxjs";

export type O = Record<string, unknown>;
export type JSXNode = O;
export type JSXContent = string | boolean | number | symbol | Function | Array<any> | object | Date | Observable<any> | JSXNode | JSXNode[];

export type ComponentProps<T extends O> = FlattenProps<T> & {
    [k in keyof T as `${string & k}$`]: Observable<T[k] extends Observable<infer R> ? R : T[k]>;
} & {
    content?: JSXNode[];
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
