import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import * as _ from 'lodash'
import * as actions from './actions'

function requests(state = { entries: [], isFetching: false }, action) {
  if(action.type === actions.FETCH_REQUESTS) {
    return _.merge({}, state, {isFetching: true});
  }
  if(action.type === actions.FETCH_SUCCESS) {
    const ordered = _.orderBy(action.response, 'startedAt', 'desc');
    return _.assign({}, state, {isFetching: false, entries: ordered});
  }
  if(action.type === actions.ADD_NEW_REQUEST) {
    const entries = _.concat(action.request, state.entries);
    return _.assign({}, state, { entries : entries });
  }
  if(action.type === actions.ADD_NEW_RESPONSE) {
    const reqId = _.get(action, 'response._id');
    const entries = _.cloneDeep(state.entries);
    const request = _.find(entries, { _id : reqId })
    request.response = action.response.response;
    request.completedAt = action.response.completedAt;
    return _.assign({}, state, { entries : entries });
  }
  if (action.type === actions.SELECT_REQUEST) {
    return _.assign({}, state, { selectedRequest : action.request });
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
