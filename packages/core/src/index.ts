import {Component, ComponentRenderer, HostNode, JSXContent, JSXNode, JSXNodeType, O} from "./types";
import {combineLatest, Observable, of} from "rxjs";
import {combineAssoc, listenNeeds, state} from "./rx";
import {JSXNodeMix} from "./nodes/jsx-mix.node";
import {makeHoc} from "./factory.hoc";
import {jsxNativeNodeFactory, reflectPropsMetadata} from "./nodes";
import {isJSXNode, isObservable} from "./helpers";

export function defineComponent<T extends O>(name: string, renderer: ComponentRenderer<T>): Component<T> {
    const CL = class extends JSXNodeMix(HTMLElement) implements JSXNode {
        static renderMethod = renderer

        // @ts-ignore
        static get name() {
            return name;
        }

        constructor(private needsPipe: ($: Observable<T & { content: JSXNode[]; }>) => Observable<JSXNode>) {
            super();
        }

        protected subscribe() {
            if (!this.subscription && this.props$$) {
                this.subscription = this.props$$
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

    Object.defineProperty(CL, 'name', {value: name});

    let eName: string = [...name].map((x, i) => x === x.toUpperCase() ? `${i > 0 ? '-' : ''}${x.toLowerCase()}` : x).join('');

    if (eName.split('-').length < 2) {
        eName = `x-${eName}`
    }

    const propsMapper: (props: Observable<T>) => Observable<JSXNode> = props$ => props$.pipe(listenNeeds<T, JSXNode>((data: T) => {
            return (CL.renderMethod as unknown as (($: T) => JSXNode))(data)
        })
    )

    try {
        customElements.define(eName, CL);

        return makeHoc(CL, propsMapper)
    } catch (e) {
        const XL = customElements.get(eName);

        XL.renderMethod = renderer;

        return makeHoc(XL, (props => props) as unknown as (($: Observable<T>) => Observable<JSXNode>))
    }
}

export function bind(node: HTMLElement, component: JSXNode) {
    if (node.childNodes.length) {

        const ref: JSXNode | unknown = node.childNodes.item(0);

        if (isJSXNode(ref) && component.isLikeYou(ref)) {
            return ref.handleProps(component.props$)
        }

        node.childNodes.forEach(child => child.remove())
    }

    node.append(component)
}

function jsx(type: JSXNodeType, props: O, ...content): JSXNode | HostNode {
    if (type === jsx || type === 'host') {
        return {
            isHost: true,
            props,
            content
        }
    }

    const arg: O = {
        ...props,
        content: content.length ? combineLatest(content.map((data: JSXContent): Observable<unknown> => {
            return isObservable(data) ? data : of(data)
        })) : content
    };

    if (typeof type === 'function') {
        return type(arg)
    }

    const r = jsxNativeNodeFactory(type);

    r.propsMetadata = reflectPropsMetadata(props ?? {});
    r.handleProps(combineAssoc(arg));

    return r
}

export default jsx;

export {
    state
}

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
