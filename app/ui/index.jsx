import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import Root from './containers/Root.jsx'
import configureStore from './store/configureStore'
import socketClient from './socketClient';

const apiRoot = 'http://localhost:3000'; //TODO: Make configurable
const store = configureStore(apiRoot);
const history = syncHistoryWithStore(browserHistory, store);

socketClient(apiRoot, store);

render(
  <Root store={store} history={history} />,
  document.getElementById('app')
)
