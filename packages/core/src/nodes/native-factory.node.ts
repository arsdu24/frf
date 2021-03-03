import {JSXNode} from "../types";

export function jsxNativeNodeFactory(type: keyof HTMLElementTagNameMap): JSXNode {

    const holder = document.createElement('div');

    holder.innerHTML = `<${type} is="x-${type}"></${type}>`

    return holder.children[0] as Node as JSXNode;
}
