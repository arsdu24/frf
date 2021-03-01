import {ConnectableObservable, Observable, ReplaySubject, Subject, Subscription} from "rxjs";

export type HotObservable<P> = ConnectableObservable<P> & {
    replace($: Observable<P>): Subscription;
    renew(mapper: ($: Observable<P>) => Observable<P>): Subscription;
}

export function hot<P>($: Observable<P>, replay = 0): HotObservable<P> {
    let sub: Subscription, $$: Observable<P> = $;
    let subject: Subject<P> = new Subject();

    if (replay) {
        subject = new ReplaySubject(replay)
    }

    const $$$: HotObservable<P> = subject.asObservable() as HotObservable<P>;

    $$$.connect = () => {
        if (sub) {
            sub.unsubscribe();
        }

        sub = $$.subscribe((x) => subject.next(x));

        return sub;
    }

    $$$.replace = ($: Observable<P>) => {
        $$ = $;

        return $$$.connect();
    }

    $$$.renew = mapper => $$$.replace(mapper($$))

    return $$$;
}
