import React from "react"
import { render, wait, fireEvent } from '@testing-library/react'

import { withExperiment, ExperimentProvider } from './index'

const _onFetch = e => {
  const data = [{
    name: 'exp1',
    variations: [
      {
        name: 'var1',
        weight: 100,
      },
    ],
  },{
    name: 'exp2',
    variations: [
      {
        name: 'var1',
        weight: 100,
      },
    ],
  }]
  
  return Promise.resolve(data.find(x => x.name === e).variations)
}

const RawComponent = p => (
  <>
    <span>Hello {p.experimentName} using variant {p.experimentVariant}</span>
    <button onClick={() => p.experimentPlay()}>Play experiment</button>
    <button onClick={() => p.experimentWin()}>Win experiment</button>
  </>
)

const PrefixRawComponent = p => (
  <>
    <span>Hello {p.prefixExperimentName} using variant {p.prefixExperimentVariant}</span>
    <button onClick={() => p.prefixExperimentPlay()}>Play experiment</button>
    <button onClick={() => p.prefixExperimentWin()}>Win experiment</button>
  </>
)

const renderHelper = (Component, options) => {

  return render(
    <ExperimentProvider options={options}>
      <Component />
    </ExperimentProvider>
  )
}

test('it renders with experiment props', async () => {
  let Component = withExperiment('exp2')(RawComponent)
  const { container } = renderHelper(Component, {
    onFetch: jest.fn(_onFetch),
  })

  await wait (() => expect(container.querySelector('span').textContent).toEqual('Hello exp2 using variant var1'))
})

test('it calls the correct functions', async () => {
  const onPlay = jest.fn()
  const onWin = jest.fn()
  const onFetch = jest.fn(_onFetch)

  let Component = withExperiment('exp1')(RawComponent)
  const { getByText } = renderHelper(Component, {
    onPlay,
    onWin,
    onFetch,
  })
  
  // Wait for component to render
  await wait (() => expect(getByText('Play experiment')))

  expect(onFetch).toHaveBeenCalledTimes(1)
  expect(onPlay).toHaveBeenCalledTimes(0)
  expect(onWin).toHaveBeenCalledTimes(0)
  
  fireEvent.click(getByText('Play experiment'))
  expect(onFetch).toHaveBeenCalledTimes(1)
  expect(onPlay).toHaveBeenCalledTimes(1)
  expect(onWin).toHaveBeenCalledTimes(0)
  
  fireEvent.click(getByText('Win experiment'))
  expect(onFetch).toHaveBeenCalledTimes(1)
  expect(onPlay).toHaveBeenCalledTimes(1)
  expect(onWin).toHaveBeenCalledTimes(1)
})

test('it auto plays experiment', async () => {
  const onPlay = jest.fn()
  const onWin = jest.fn()
  const onFetch = jest.fn(_onFetch)

  let Component = withExperiment('exp1', {
    autoPlay: true
  })(RawComponent)
  const { getByText } = renderHelper(Component, {
    onPlay,
    onWin,
    onFetch,
  })
  
  // Wait for component to render
  await wait (() => expect(getByText('Play experiment')))

  expect(onFetch).toHaveBeenCalledTimes(1)
  expect(onPlay).toHaveBeenCalledTimes(1)
  expect(onWin).toHaveBeenCalledTimes(0)
})

test('it renders with prefixed experiment props', async () => {
  let Component = withExperiment('exp2', {
    propPrefix: 'prefix'
  })(PrefixRawComponent)
  const { container } = renderHelper(Component, {
    onFetch: jest.fn(_onFetch),
  })

  await wait (() => expect(container.querySelector('span').textContent).toEqual('Hello exp2 using variant var1'))
})
