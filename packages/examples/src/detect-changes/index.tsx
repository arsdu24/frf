import {defineComponent} from "@frxf/core";
import {timer} from "rxjs";
import {map} from "rxjs/operators";

const App = defineComponent<{ age: number; firstName: string }>('App', ({content, age$, firstName$}) => {
    return <div>
        <br/>
        <i>{age$}</i>
        <br/>
        <span>{firstName$}</span>
        <br/>
        {content}
    </div>
})

console.log(
    document.querySelector('#app'),
    <App
        age={timer(0, 1000)}
        firstName={timer(0, 5000).pipe(
            map(x => `Hello'${x}`)
        )}
    >
        Hello MotherFucker
    </App>,
    <div>
        <br/>
        <i>12</i>
        <br/>
        <span>23</span>
        <br/>
        34
    </div>
);

if (module['hot']) {
    module['hot'].accept();
}

