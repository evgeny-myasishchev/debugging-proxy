import React, { PropTypes } from 'react'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import routes from '../routes.jsx'
// import DevTools from './DevTools.jsx'

export default function Root(props) {
  const { store, history } = props
  return (
    <Provider store={store}>
      <div>
        <Router history={history} routes={routes} />
        { /*<DevTools /> */}
      </div>
    </Provider>
  )
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}
