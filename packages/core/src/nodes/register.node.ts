import {JSXNodeMix} from "./jsx-mix.node";

function defineCustomElementWrapper(Cls: { new (): HTMLElement }) {
    const type: string = Cls.name.toLowerCase();

    customElements.define(`x-${type}`, Cls, { extends: type });
}

try {
    defineCustomElementWrapper(class Div extends JSXNodeMix(HTMLDivElement) {});
    defineCustomElementWrapper(class Br extends JSXNodeMix(HTMLBRElement) {});
    defineCustomElementWrapper(class I extends JSXNodeMix(HTMLElement) {});
    defineCustomElementWrapper(class Span extends JSXNodeMix(HTMLSpanElement) {});
    defineCustomElementWrapper(class A extends JSXNodeMix(HTMLAnchorElement) {});
    defineCustomElementWrapper(class Ul extends JSXNodeMix(HTMLUListElement) {});
    defineCustomElementWrapper(class Ol extends JSXNodeMix(HTMLOListElement) {});
    defineCustomElementWrapper(class Table extends JSXNodeMix(HTMLTableElement) {});
} catch (e) {
    console.info((e as Error).message)
}
