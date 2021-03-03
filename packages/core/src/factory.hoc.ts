import {Component, JSXNode, O} from "./types";
import {Observable} from "rxjs";
import {combineAssoc, listenNeeds} from "./rx";

export function makeHoc<T extends O>(Component: ({
    new(pipe: ($: Observable<T>) => Observable<JSXNode>)
}), propsMapper: (props: Observable<T>) => Observable<JSXNode>): Component<T> {
    const C: Component<T> = (() => {}) as unknown as Component<T>;

    return new Proxy(C, {
        apply(target, that, [props]) {
            const cmp: JSXNode =  new Component(propsMapper)

            cmp.handleProps(combineAssoc<T>(props))

            return cmp;
        },
        get(target: Component<T>, prop: keyof Component<T>) {
            if (prop === 'name') {
                return Component.name;
            }

            if (prop === 'mapProps') {
                return (controller: (props: T) => T | Observable<T>): Component<T> => {
                    return makeHoc(Component, (p$: Observable<T>) =>  {
                        return p$.pipe(
                            listenNeeds<T, T>(controller),
                            propsMapper
                        )
                    })
                }
            }
        }
    });
}
