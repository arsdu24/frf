import {bind, defineComponent, state} from "@frxf/core";
import {of, timer} from "rxjs";
import {map, tap} from "rxjs/operators";

const App = defineComponent<{ age: number; firstName: string }>('App', ({content, age$, firstName, $}) => {
    const [i$, pushI] = state(of(-1));
    let x = 125

    return <host style={{ margin: 10 }}>
        <br/>
        <i>{age$.pipe(tap(() => {
            pushI(i => i + 1);
        }))} {x} {i$}</i>
        <br/>
        <div>
            <span>{$.pipe(map(({ firstName, age }) => `${age}|${firstName}`))}</span>
            {firstName}
            <br/>
            {content}
        </div>
    </host>
})

bind(document.querySelector('#app'), <App age={timer(0, 1000)} firstName="hey" />)

if (module['hot']) {
    module['hot'].accept();
}

