import {O} from "../types";
import {combineLatest, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {isObservable} from "../helpers";

export type AssociativeObservable<T extends O> = {
    [k in keyof T]: T[k] | (T[k] extends Observable<infer R> ? R : Observable<T[k]>);
}

export function combineAssoc<P extends O>(sources: AssociativeObservable<P>): Observable<P> {
    const keys: (keyof P)[] = Object.keys(sources) as (keyof P)[];
    const streams: Observable<any>[] = keys
        .map((key): Observable<any> => {
            const value = sources[key];
            const stream = isObservable(value) ? value : new Observable(s => s.next(value));

            return stream.pipe(shareReplay(1));
        });

    return combineLatest(streams).pipe(
        map((args): P => {
            return args.reduce(
                (acc: P, value: unknown, index: number): P => ({
                    ...acc,
                    [keys[index]]: value
                }),
                ({} as unknown as P));
        })
    )
}
