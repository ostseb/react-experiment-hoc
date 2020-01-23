import React, { Component } from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import cookies from 'js-cookie';

import Context from './Context';
import weighted from './weighted';

const DEFAULT_OPTIONS = {
  /**
   * Wheter the experiment should be persistant betwen renders & sesions.
   * 
   * -1 evaluate on every render
   * 0 evaluate on every session
   * 1 evaluate once  
   * 
   * @default 1 
   */
  persistent: 1,

  /**
   * Auto play experiment on render
   * 
   * @default false
   */
  autoPlay: false,

  /**
   * Name of the fallback variation if fetch fails
   * 
   * @default original
   */
  fallbackName: 'original',

  /**
   * Fetch method returns variations of the given experiment
   * 
   * @param experiment
   *  
   * @returns Promise(array) 
   * @default Promise.resolve([]) 
   */
  onFetch: () => Promise.resolve([]),

  /**
   * Trigger play
   * 
   * @param experiment
   * @param variation
   *  
   * @returns Promise() 
   * @default Promise.resolve()
   */
  onPlay: () => Promise.resolve([]),

  /**
   * Trigger wib
   * 
   * @param experiment
   * @param variation
   *  
   * @returns Promise() 
   * @default Promise.resolve() 
   */
  onWin: () => Promise.resolve(),

  /**
   * Set cookie method
   * 
   * @param name
   * @param value
   * @param options
   *  
   * @default js-cookie.set
   */
  setCookie: cookies.set,

  /**
   * Get cookie method
   * 
   * @param name
   * @param options
   *  
   * @default js-cookie.get
   */
  getCookie: cookies.get,
};

export default (experiment, options = {}) => BaseComponent => {

  class ExperimentComponent extends Component {
    constructor(props) {
      super(props);

      this.state = {
        started: false,
        fallback: false,
        variants: [],
        variant: null
      }

      this._options = Object.assign({}, DEFAULT_OPTIONS, options)
    }

    componentWillMount() {
      // Apply context options
      const context = this.context || {}
      this._options = Object.assign({}, this._options, context)
    }

    componentDidMount() {
      const { variants } = this.state;
      const { autoPlay, fallbackName } = this._options;

      if (variants.length === 0) {
        this.fetch(experiment)
        .then(data => {
          const variant = this.getVariant(data);

          this.setState({
            fallback: false,
            variant,
            variants: data
          });

          if (autoPlay && variant)
            this.play(variant);
        })
        .catch(() => {
          const fallbackVariant = {
            name: fallbackName,
            weight: 100
          };

          this.setState({
            fallback: true,
            variant: fallbackVariant,
            variants: [fallbackVariant]
          })
        })
      }
    }

    getVariant(variants) {
      const { fallback } = this.state;
      if (variants.length === 0)
        return null
        
      const { persistent, setCookie, getCookie } = this._options;
      const key = `experiment_${experiment}${persistent}`;
      const cookieIndex = getCookie(key);
      let index = cookieIndex;
      
      if (!index || !variants[index] || persistent < 0)
        index = weighted(variants.map(v => v.weight));

      if (!cookieIndex && !fallback && persistent >= 0)
        setCookie(key, index, {
          path: '/',
          expires: !persistent ? null : new Date(Date.now()+(60 * 60 * 24 * 365 * 10 * 1000)),
        });

      return variants[index].name;
    }

    win(variant) {
      if (!this.state.started)
        return console.warn(
          `[react-experiment-hoc] Experiment "${experiment}" triggerd win without beeing started. Make sure you trigger play before win.`
        );
      
      if (this.state.fallback)
        return console.warn(
          `[react-experiment-hoc] Experiment "${experiment}" is using fallback. Win will not be registerd.`
        );

      this._options.onWin(experiment, variant);
      console.info(`[react-experiment-hoc] Experiment "${experiment}" with variant "${variant}" win.`);
    }

    play(variant) {
      if (this.state.started)
        return console.warn(`[react-experiment-hoc] Experiment "${experiment}" has already started.`);
      
      if (this.state.fallback)
        return console.warn(
          `[react-experiment-hoc] Experiment "${experiment}" is using a fallback variant. Play will not be registerd.`
        );

      this.setState({
        started: true
      })

      this._options.onPlay(experiment, variant);
      console.info(`[react-experiment-hoc] Experiment "${experiment}" with variant "${variant}" started.`);
    }

    fetch(e) {
      return this._options.onFetch(e)
    }

    render() {
      const { variant } = this.state;
      
      if (!this.state.started && !variant)
        console.info(`[react-experiment-hoc] Render component while waiting for variants of experiment "${experiment}".`);
      
      if (!this.state.started && variant)
        console.info(`[react-experiment-hoc] Render experiment "${experiment}" with variant "${variant}".`);
    
      if (!variant) return null;

      const uniqueTestProps = {
        [experiment]: {
          play: () => this.play(variant),
          win: () => this.win(variant),
          variant,
          name: experiment
        }
      }
        
      return (
        <BaseComponent
          {...this.props}
          {...uniqueTestProps}
        />
      );
    }
  }

  ExperimentComponent.contextType = Context;

  return hoistNonReactStatic(ExperimentComponent, BaseComponent);
}