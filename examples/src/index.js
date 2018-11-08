import React from 'react';
import { render} from 'react-dom';
import axios from 'axios';

import { withExperiment, ExperimentProvider } from '../../src';

const _request = (method, data) => {
    const url = `https://us-central1-abdb-7c7f7.cloudfunctions.net`;
    const options = {
        timeout: method === 'fetch' ? 750 : 0, // We don't want to wait for the variations
        params: data,
    }

    return axios
        .get(`${url}/${method}`, options)
        .then(r => r.data)
}

const experimentOptions = {
    onFetch: e => _request('fetch', {e}),
    onPlay: (e,v) => _request('play', {e,v}),
    onWin: (e,v) => _request('win', {e,v})
};

const App = () => (
    <ExperimentProvider options={experimentOptions}>
        <p>This app is running experiments</p>
        <ExBtn />
    </ExperimentProvider>
);

const Btn = ({experimentWin, experimentVariant: v}) => (
    <button 
        style={{
            opacity: !v ? 0 : 1,
            background: v === 'green-cta' ? 'green' : '',
        }}
        onClick={experimentWin}
    >
    PRESS ME!
    </button>
)

const ExBtn = withExperiment('new-cta-colors', {
    autoPlay: true
})(Btn)

render(<App />, document.getElementById("root"));