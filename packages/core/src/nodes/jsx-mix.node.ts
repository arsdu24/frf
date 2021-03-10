import {JSXNode, JSXNodePropsMetadata, O} from "../types";
import {Observable, of, Subscription} from "rxjs";
import {isSimilar} from "./is-similar.node";
import {hot, HotObservable} from "../rx";
import {detectChanges} from "./detect-changes.node";
import {isJSXNode} from "../helpers";

export function JSXNodeMix<T extends O & { content: JSXNode[] }>(K: { new(): HTMLElement }) {
    return class JSXNodeMix extends K implements JSXNode {
        protected props$$: HotObservable<T> = hot(of(), 1);
        protected subscription?: Subscription;
        private _propsMetadata: JSXNodePropsMetadata;

        get props$() {
            return this.props$$.$;
        }

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
            this.props$$.replace(props as Observable<T>);

            if (this.subscription) {
                this.subscription.unsubscribe();
                this.subscription = undefined;
            }

            this.subscribe();
        }

        protected subscribe() {
            if (!this.subscription && this.props$$ && this.isConnected) {
                this.subscription = this.props$$
                    .subscribe(({content, ...attributes}) => {
                        console.log(this, content)
                        this.applyAttributes(attributes);
                        this.attachChildList(content);
                    })
            }
        }

        protected applyAttributes(attributes: O) {
            Object.entries(attributes).forEach(([name, value]) => this.setAttribute(name, `${value}`));
        }

        protected attachChildList(nextChildList: JSXNode[]) {
            let lastNode: Node;
            const currentChildList: Node[] = [...this.childNodes as unknown as Node[]];
            const currentTexts: Node[] = currentChildList.filter((node) => node.nodeName === '#text');
            const texts: { i: number; prev: Node | undefined; current: string }[] = nextChildList
                .map((node, i) => ({i, node}))
                .filter(({node}) => !isJSXNode(node))
                .map(({i, node}, j) => ({
                    i, prev: currentTexts[j], current: `${node}`
                }));

            detectChanges(
                currentChildList.filter(isJSXNode),
                nextChildList.filter(isJSXNode)
            ).forEach((x: Partial<Record<'remove' | 'add' | 'update' | 'from', JSXNode>>) => {
                if (x?.update && x?.from) {
                    x.update.handleProps(x.from.props$);

                    lastNode = x.update;
                }

                if (x?.remove) {
                    lastNode = x.remove.previousSibling;

                    this.removeChild(x.remove)
                }

                if (x?.add) {
                    if (lastNode) {
                        if (lastNode.nextSibling) {
                            return this.insertBefore(x.add, lastNode.nextSibling)
                        }
                    }

                    this.append(x.add)
                }
            });

            texts.map(({i, prev, current}) => {
                if (prev) {
                    prev.textContent = current;
                } else {
                    const sibling: Node = this.childNodes.item(i);

                    this.insertBefore(document.createTextNode(current), sibling);
                }
            })

            currentTexts.filter(t => !texts.some(({prev}) => prev === t)).forEach(t => this.removeChild(t))
        }

        isLikeYou(like: JSXNode): boolean {
            return isSimilar(this, like)
        }

        protected connectedCallback(): void {
            this.props$$.connect();

            this.subscribe();
        }

        protected disconnectedCallback(): void {
            if (this.subscription) {
                this.subscription.unsubscribe();
            }
        }
    }
}
