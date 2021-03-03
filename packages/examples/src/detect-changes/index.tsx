import {bind, defineComponent} from "@frxf/core";
import {timer} from "rxjs";

const App = defineComponent<{ age: number; firstName: string }>('App', ({content, age, firstName}) => {
    const name: string = firstName;

    return <host style={{ margin: 10 }}>
        <br/>
        <i>{age}</i>
        <br/>
        <div>
            <span>{name}</span>
            <br/>
            {content}
        </div>
    </host>
})

bind(document.querySelector('#app'), <App age={timer(0, 1000)} firstName="hey" />)

if (module['hot']) {
    module['hot'].accept();
}

