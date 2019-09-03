import React from 'react';
import Context from './Context';

export default ({children, options={}}) => (
  <Context.Provider value={options}>
    { children }
  </Context.Provider>
)