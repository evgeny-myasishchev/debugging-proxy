import React from 'react'
import { Route } from 'react-router'
import App from './containers/App.jsx'
import Hello from './containers/Hello.jsx'

export default (
  <Route path="/" component={App}>
    <Route path="/hello" component={Hello} />
  </Route>
)
