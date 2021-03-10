import {JSXNode, O} from "../types";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {distinctUntilChanged, filter, map, pluck, switchMap, tap} from "rxjs/operators";
import {combineAssoc} from "./combine-assoc.rx";
import {isObservable} from "../helpers";

export function state<T>(): [Observable<T | undefined>, ((data: T | ((prev: T | undefined) => T)) => void)]
export function state<T>(source$: Observable<T>): [Observable<T | undefined>, ((data: T | ((prev: T | undefined) => T)) => void)]
export function state<T>(value: T): [Observable<T>, ((data: T | ((prev: T) => T)) => void)]
export function state<T>(value?: T | Observable<T>): [Observable<T>, ((data: T | ((prev: T) => T)) => void)] {
    if (typeof state['memo'] !== 'undefined' && typeof state['memo'].next === "function") {
        return state['memo'].next();
    }

    const $$: BehaviorSubject<T> = new BehaviorSubject<T>(!value || isObservable(value) ? undefined : value);

    if (value && isObservable(value)) {
        value.subscribe((value) => $$.next(value))
    }

    const result: [Observable<T>, ((data: T | ((prev: T) => T)) => void)] = [
        $$.asObservable().pipe(
            distinctUntilChanged()
        ),
        data => {
            if (typeof data === 'function') {
                $$.next((data as ((prev: T | undefined) => T))($$.value))
            } else {
                $$.next(data)
            }
        }
    ];

    if (typeof state['memo'] !== 'undefined' && typeof state['memo'].keep === "function") {
        state['memo'].keep(result);
    }

    return result
}

export function listenNeeds<T extends O, R extends O | JSXNode>(mapper: (data: T) => R | Observable<R>) {
    let needs: [keyof T, unknown][];
    const memo = { state: [] };

    return (origin$: Observable<T>): Observable<R> => {
        return combineLatest([
            origin$,
            new Observable(subscriber => {
                if (module['hot']) {
                    module['hot'].addStatusHandler(status => {
                        if (status === 'idle') {
                            setTimeout(() => {
                                needs = undefined;
                                subscriber.next(status)
                            }, 0)
                        }
                    })
                }

                subscriber.next(0)
            })
        ]).pipe(
            map(([props]) => props),
            filter((data) => !needs || !!needs.find(([key, value]) => data[key] !== value)),
            tap(() => needs = []),
            switchMap((data: T) => {
                let memoCnt = { state: 0 };

                state['memo'] = {
                    next() {
                        memoCnt.state++;

                        if (memo.state.length === memoCnt.state) {
                            state['memo'].next = undefined;
                        }

                        return memo.state[memoCnt.state - 1];
                    },
                    keep(result) {
                        memo.state.push(result)
                    }
                }

                if (memo.state.length === memoCnt.state) {
                    state['memo'].next = undefined;
                }

                const r$: R | Observable<R> = mapper(new Proxy(data, {
                    get: (target: T, key): any => {
                        const value = target[key as keyof T];

                        if (key === '$') {
                            return origin$
                        }

                        if (`${key as keyof T}`.endsWith('$')) {
                            return origin$.pipe(pluck(`${key as keyof T}`.slice(0, -1)))
                        }

                        if (key !== 'content') {
                            needs.push([key as keyof T, value])
                        }

                        return value;
                    }
                }));

                if (isObservable(r$)) {
                    return r$
                }

                return combineAssoc(r$ as O) as Observable<R>
            })
        )
    }
}
