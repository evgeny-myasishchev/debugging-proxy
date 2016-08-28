import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import * as ActionTypes from './actions'

// Updates error message to notify about the failed fetches.
function errorMessage(state = null, action) {
  const { type, error } = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return action.error
  }

  return state
}

const rootReducer = combineReducers({
  errorMessage,
  routing
})

export default rootReducer
