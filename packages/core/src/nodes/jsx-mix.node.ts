import {JSXNode, JSXNodePropsMetadata, O} from "../types";
import {Observable, of, Subscription} from "rxjs";
import {isSimilar} from "./is-similar.node";
import {hot, HotObservable} from "../rx";
import {isJSXNode, isObservable} from "../helpers";
import {tap} from "rxjs/operators";

export function JSXNodeMix<T extends O & { content: JSXNode[] }>(K: { new (): HTMLElement }) {
    return class JSXNodeMix extends K implements JSXNode {
        protected props$: HotObservable<T> = hot(of(), 1);
        protected subscription?: Subscription;
        protected rendered: boolean = false;
        private _propsMetadata: JSXNodePropsMetadata;

        get propsMetadata(): JSXNodePropsMetadata {
            return this._propsMetadata || {}
        }

        set propsMetadata(value: JSXNodePropsMetadata) {
            if (this._propsMetadata) {
                return
            }

            this._propsMetadata = value;
        }

        handleProps(props: Observable<unknown>) {
            this.props$.replace(props as Observable<T>);
            this.subscribe();
        }

        protected subscribe() {
            if (!this.subscription && this.props$ && this.rendered) {
                this.subscription = this.props$.pipe(
                    tap(console.log)
                )
                    .subscribe(({ content, ...attributes }) => {
                        this.applyAttributes(attributes);
                        this.attachChildList(content);
                    })
            }
        }

        protected applyAttributes(attributes: O) {
            Object.entries(attributes).forEach(([name, value]) => this.setAttribute(name, `${value}`));
        }

        protected attachChildList(childList: JSXNode[]) {
            this.innerHTML = '';

            childList.forEach(c => {
                if (isJSXNode(c)) {
                    this.append(c)
                } else {
                    const data$: Observable<string> = isObservable(c) ? c : of(c);
                    const text: Node = document.createTextNode('');

                    data$.subscribe(data => text.textContent = data);

                    this.append(text);
                }
            })
        }

        isLikeYou(like: JSXNode): boolean {
            return isSimilar(this, like)
        }

        private connectedCallback() {
            this.rendered = true;

            this.props$.connect();

            this.subscribe();
        }

        private disconnectedCallback() {
            this.rendered = false;

            if (this.subscription) {
                this.subscription.unsubscribe();
            }
        }
    }
}
