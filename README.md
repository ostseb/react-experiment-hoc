# react-experiment-hoc
A/B-test components with a simple hoc

[![Latest Stable Version](https://img.shields.io/npm/v/react-experiment-hoc.svg)](https://www.npmjs.com/package/react-experiment-hoc)
[![License](https://img.shields.io/npm/l/react-experiment-hoc.svg)](https://raw.githubusercontent.com/ostseb/react-experiment-hoc/master/LICENSE)

## Usage

```
withExperiment(experiment-name, [options])(Component)
```

### Options

| Name | Description | Type | Default |
|------|-------------|------|---------|
| persistent | Wheter the experiment should be persistant for sesions. -1 evaluate on every render, 0 evaluate on every session, 1 evaluate once. | int | 1 |
| autoPlay | Auto play experiment on render | bool | false |
| fallbackName | Name of the fallback variation if fetch fails | string | 'original' |
| onFetch | Fetch method returns variations of the given experiment | function<Promise> | Promise.resolve([]) |
| onPlay | Trigger play | function<Promise> | Promise.resolve() |
| onWin | Trigger win | function<Promise> | Promise.resolve() |
| setCookie | Set cookie method | function | js-cookie.set |
| getCookie | Get cookie method | function | js-cookie.get |

## Example
```js
import { ExperimentContext, withExperiment } from 'react-experiment-hoc';

// App
const App = () => (
    <ExperimentProvider options={experimentOptions}>
        <p>This app is running experiments!</p>
        <ExperimentBtn />
    </ExperimentProvider>
);

// Original component
const Btn = ({experimentWin,experimentVariant: v}) => (
    <button style={{
            opacity: !v ? 0 : 1,
            background: v === 'green-cta' ? 'green' : '',
        }}
        onClick={experimentWin}>
        PRESS ME!
    </button>
)

// Apply the experiments
const ExperimentBtn = withExperiment('new-cta-colors', {
    autoPlay: true
})(Btn)

render(<App />, document.getElementById("root"));
```