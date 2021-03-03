import {O} from "../types";
import {Observable} from "rxjs";
import {filter, pluck, switchMap, tap} from "rxjs/operators";
import {combineAssoc} from "./combine-assoc.rx";
import {isObservable} from "../helpers";

export function listenNeeds<T extends O, R extends O>(mapper: (data: T) => R | Observable<R>) {
    let needs: [keyof T, unknown][];

    return (origin$: Observable<T>): Observable<R> => {
        return origin$.pipe(
            filter((data) => !needs || !!needs.find(([key, value]) => data[key] !== value)),
            tap(() => needs = []),
            switchMap((data: T) => {
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

                return combineAssoc(r$) as Observable<R>
            })
        )
    }
}
