import {JSXNode} from "../types";
import {isSimilar} from "./is-similar.node";

export function detectChanges(previous: JSXNode[], currents: JSXNode[]): Partial<Record<'remove' | 'add' | 'update' | 'from', JSXNode>>[] {
    const result: Partial<Record<'remove' | 'add' | 'after' | 'update' | 'from', JSXNode>>[] = [];
    let positionInPrevious: number = 0,
        positionInCurrents: number = 0,
        previousPart: JSXNode[];

    const firstMatchedNodeIndex: number = previous.findIndex((node: JSXNode) => isSimilar(node, currents[positionInCurrents]));

    previous.slice(0, firstMatchedNodeIndex).forEach(node => result.push({remove: node}));

    previousPart = previous.slice(firstMatchedNodeIndex);

    while (positionInPrevious < previousPart.length && positionInCurrents < currents.length) {
        const ac: JSXNode = previousPart[positionInPrevious],
            bc: JSXNode = currents[positionInCurrents];

        if (isSimilar(ac, bc)) {
            result.push({ update: ac, from: bc });
            positionInPrevious++;
            positionInCurrents++;
            continue;
        }

        const ap: JSXNode[] = previous.slice(positionInPrevious);
        const nextInB: number = ap.findIndex(x => isSimilar(x, bc));

        if (nextInB === -1) {
            result.push({ add: bc});

            positionInCurrents++;
        } else {
            ap.slice(0, nextInB).forEach(x => result.push({remove: x}))

            positionInPrevious += nextInB;
        }
    }

    previousPart.slice(positionInPrevious).forEach(x => result.push({remove: x}));
    currents.slice(positionInCurrents).forEach(x => result.push({add: x}));

    return result;
}
