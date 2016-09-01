import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import * as _ from 'lodash'
import * as actions from './actions'

function requests(state = { entries: [], isFetching: false }, action) {
  if(action.type === actions.FETCH_REQUESTS) {
    return _.merge({}, state, {isFetching: true});
  }
  if(action.type === actions.FETCH_SUCCESS) {
    return _.assign({}, state, {isFetching: false, entries: action.response});
  }
  return state;
}

// Updates error message to notify about the failed fetches.
function errorMessage(state = null, action) {
  const { type, error } = action

  if (type === actions.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return action.error
  }

  return state
}

const rootReducer = combineReducers({
  requests,
  errorMessage,
  routing
})

export default rootReducer
