import { createStore, applyMiddleware, compose } from 'redux'
import { persistState } from 'redux-devtools';
import devTools from 'remote-redux-devtools';
import thunk from 'redux-thunk'
import api from '../middleware/api'
import rootReducer from '../reducers'

export default function configureStore(apiRoot, preloadedState) {
  const enhancer = compose(
    applyMiddleware(thunk, api(apiRoot)), 
    devTools({
      realtime : process.env.NODE_ENV !== 'production',
      hostname : 'localhost',
      port : 8000
    }),
    persistState(getDebugSessionKey)
  );
  const store = createStore(rootReducer, preloadedState, enhancer);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
  
      store.replaceReducer(nextRootReducer)
    })
  }

  devTools.updateStore(store);

  return store
}

function getDebugSessionKey() {
  const matches = window.location.href.match(/[?&]debug-session=([^&#]+)\b/);
  return (matches && matches.length > 0)? matches[1] : null;
}
