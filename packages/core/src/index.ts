import {AllowedProps, Component, ComponentProps, ComponentRenderer, O} from "./types";
import {Observable, Subscription} from "rxjs";
import {filter, map, pluck, shareReplay, switchMap, tap} from "rxjs/operators";
import {combineAssoc, hot, HotObservable} from "./rx";

export function observeProps<T extends O>(props: T, props$: Observable<T>, track: (key: keyof T, value: unknown) => void): ComponentProps<T> {
    return new Proxy(props, {
        get: (target: T, key): any => {
            const value = target[key as keyof T];

            if (key === '$') {
                return props$
            }

            if (`${key as keyof T}`.endsWith('$')) {
                return props$.pipe(pluck(`${key as keyof T}`.slice(0, -1)))
            }

            if (key !== 'content') {
                track(key as keyof T, value)
            }

            return value;
        }
    }) as ComponentProps<T>
}

export function makeHoc<T extends O>(Component: ({
    new(props$?: Observable<T>)
}), propsMapper?: (props: Observable<T>) => Observable<T>): Component<T> {
    return new Proxy((() => {
    }) as unknown as Component<T>, {
        apply(target, that, [props]) {
            let props$ = combineAssoc<T>(props);

            if (propsMapper) {
                props$ = propsMapper(props$);
            }

            return new Component(props$)

        },
        get(target: Component<T>, prop: keyof Component<T>) {
            if (prop === 'name') {
                return Component.name;
            }
            if (prop === 'mapProps') {

                return (controller: (props: ComponentProps<T>) => AllowedProps<T> | Observable<T>): Component<T> => {
                    let propsDeeps: [keyof T, unknown][] = [];

                    return makeHoc(Component, p$ => {
                        let props$ = p$;

                        if (propsMapper) {
                            props$ = propsMapper(props$);
                        }

                        return props$.pipe(
                            filter((props) => !propsDeeps || !!propsDeeps.find(([key, value]) => props[key] !== value)),
                            switchMap(props => {
                                const p$: AllowedProps<T> | Observable<T> = controller(observeProps(props, props$, (key, value) => propsDeeps.push([key, value])));

                                if (p$ instanceof Observable) {
                                    return p$
                                }

                                return combineAssoc(p$)
                            }),
                            tap(() => propsDeeps = [])
                        )
                    })
                }
            }
        }
    });
}

export function defineComponent<T extends O>(name: string, renderer: ComponentRenderer<T>): Component<T> {
    return makeHoc(class extends HTMLElement {
        private props$?: HotObservable<T>;
        private subscription?: Subscription;
        private rendered: boolean;
        private propsDeeps: [keyof T, unknown][] = [];

        // @ts-ignore
        static get name() {
            return name;
        }

        constructor(props$?: Observable<T>) {
            super();

            this.rendered = false;

            if (props$) {
                this.props$ = hot(props$.pipe(shareReplay(1)));
            }
        }

        private subscribe() {
            if (!this.subscription && this.props$) {
                this.subscription = this.props$
                    .pipe(
                        filter((props) => !this.propsDeeps || !!this.propsDeeps.find(([key, value]) => props[key] !== value)),
                        map(props => observeProps(props, this.props$, (key, value) => this.propsDeeps.push([key, value])))
                    )
                    .subscribe(props => this.tap(props))
            }
        }

        private connectedCallback() {
            this.rendered = true;

            if (this.props$) {
                this.props$.connect();
            }

            this.subscribe();
        }

        private tap(props: ComponentProps<T>) {
            const r = renderer(props)
        }

        replaceProps(props$: Observable<T>) {
            this.props$.replace(props$);
        }

        disconnectedCallback() {
            this.rendered = false;

            if (this.subscription) {
                this.subscription.unsubscribe();
            }
        }
    })
}

export default (x,y,...r) => {
    return { x, y, r }
}
