import {Component, ComponentRenderer, HostNode, JSXNode, JSXNodeType, O} from "./types";
import {Observable, of, Subscription} from "rxjs";
import {combineAssoc, hot, HotObservable, listenNeeds} from "./rx";
import {JSXNodeMix} from "./nodes/jsx-mix.node";
import {makeHoc} from "./factory.hoc";
import {jsxNativeNodeFactory, reflectPropsMetadata} from "./nodes";
import { tap } from "rxjs/operators";

export function defineComponent<T extends O>(name: string, renderer: ComponentRenderer<T>): Component<T> {
    const CL = class extends JSXNodeMix(HTMLElement) implements JSXNode {
        // @ts-ignore
        static get name() {
            return name;
        }

        constructor(private needsPipe: ($: Observable<T & { content: JSXNode[]; }>) => Observable<JSXNode>) {
            super();
        }

        protected subscribe() {
            if (!this.subscription && this.props$) {
                this.subscription = this.props$
                    .pipe(
                        this.needsPipe,
                    )
                    .subscribe(props => this.tap(props))
            }
        }

        private tap(result: JSXNode) {
            const host: HostNode = result as unknown as HostNode;

            if (host.isHost) {
                this.applyAttributes(host.props);
                this.attachChildList(host.content);
            } else {
                this.attachChildList([result])
            }
        }
    };

    Object.defineProperty (CL, 'name', {value: name});

    let eName: string = [...name].map((x,i) => x === x.toUpperCase() ? `${i > 0 ? '-' : ''}${x.toLowerCase()}` : x).join('');

    if (eName.split('-').length < 2) {
        eName = `x-${eName}`
    }

    customElements.define(eName, CL);

    return makeHoc(CL, props$ => props$.pipe(
        listenNeeds(renderer as unknown as (($: T) => O)) as unknown as (($: Observable<T>) => Observable<JSXNode>)
    ))
}

export function bind(node: HTMLElement, component: JSXNode) {
    node.append(component);
}

function jsx(type: JSXNodeType, props: O, ...content): JSXNode | HostNode {
    const arg: O = {...props, content};

    if (type === jsx || type === 'host' ) {
        return {
            isHost: true,
            props,
            content
        }
    }

    if (typeof type === 'function') {
        return type(arg)
    }

    const r = jsxNativeNodeFactory(type);

    r.propsMetadata = reflectPropsMetadata(props ?? {});
    r.handleProps(combineAssoc(arg));

    return r
}

export default jsx;

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
