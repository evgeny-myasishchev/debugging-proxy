import _ from 'lodash';
import { CALL_API } from './middleware/api'

export const FETCH_REQUESTS = 'FETCH_REQUESTS'
export const FETCH_SUCCESS = 'FETCH_SUCCESS'
export const FETCH_FAILURE = 'FETCH_FAILURE'

// Fetches a single user from Github API.
// Relies on the custom API middleware defined in ../middleware/api.js.
export function fetchRequests() {
  return (despatch) => despatch({
    [CALL_API]: {
      types: [ FETCH_REQUESTS, FETCH_SUCCESS, FETCH_FAILURE ],
      endpoint: `/api/v1/requests`
    }
  })
}

export const FETCH_REQUEST_BODY = 'FETCH_REQUEST_BODY'
export const FETCH_REQ_BODY_SUCCESS = 'FETCH_REQ_BODY_SUCCESS'
export const FETCH_REQ_BODY_FAILURE = 'FETCH_REQ_BODY_FAILURE'
export const FETCH_REQ_HAS_NO_BODY = 'FETCH_REQ_HAS_NO_BODY'

// Fetches a single user from Github API.
// Relies on the custom API middleware defined in ../middleware/api.js.
export function fetchRequestBody(request) {
  if(request.request.method === 'GET') {
    return (despatch) => despatch(fetchRequestHasNoBody(request));
  }
  const requestId = _.get(request, '_id');
  return (despatch) => despatch({
    request,
    [CALL_API]: {
      types: [ FETCH_REQUEST_BODY, FETCH_REQ_BODY_SUCCESS, FETCH_REQ_BODY_FAILURE ],
      endpoint: `/api/v1/requests/${requestId}`
    }
  })
}

export function fetchRequestHasNoBody(request) {
  return { type : FETCH_REQ_HAS_NO_BODY, request }
}

export const FETCH_RESPONSE_BODY = 'FETCH_RESPONSE_BODY';
export const FETCH_RES_BODY_SUCCESS = 'FETCH_RES_BODY_SUCCESS';
export const FETCH_RES_BODY_FAILURE = 'FETCH_RES_BODY_FAILURE';

export function fetchResponseBody(request) {
  const requestId = _.get(request, '_id');
  return (despatch) => despatch({
    request,
    [CALL_API]: {
      types: [ FETCH_RESPONSE_BODY, FETCH_RES_BODY_SUCCESS, FETCH_RES_BODY_FAILURE ],
      endpoint: `/api/v1/requests/${requestId}/response`
    }
  })
}

export const PURGE_REQUESTS = 'PURGE_REQUESTS';
export const PURGE_REQUESTS_SUCCESS = 'PURGE_REQUESTS_SUCCESS';
export const PURGE_REQUESTS_FAILURE = 'PURGE_REQUESTS_FAILURE';

export function purgeRequests() {
  return (despatch) => despatch({
    [CALL_API]: {
      types: [ PURGE_REQUESTS, PURGE_REQUESTS_SUCCESS, PURGE_REQUESTS_FAILURE ],
      endpoint: `/api/v1/requests`,
      method : 'DELETE'
    }
  })
}

export const ACTIVATE_REQUEST_DETAILS_TAB = 'ACTIVATE_REQUEST_DETAILS_TAB';

export function activateRequestDetailsTab(request, tab) {
  return { type : ACTIVATE_REQUEST_DETAILS_TAB, request, tab };
}

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'

// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}

export const ADD_NEW_REQUEST = 'ADD_NEW_REQUEST';

export function addNewRequest(request) {
  return { type : ADD_NEW_REQUEST, request };
}

export const ADD_NEW_RESPONSE = 'ADD_NEW_RESPONSE';

export function addNewResponse(response) {
  return { type : ADD_NEW_RESPONSE, response };
}

export const TOGGLE_REQUEST_LIST_ITEM = 'TOGGLE_REQUEST_LIST_ITEM';

export function toggleRequestListItem(request) {
  const requestId = _.get(request, '_id');
  if(!requestId) throw new Error('Provided request does not have an _id property');
  return { type: TOGGLE_REQUEST_LIST_ITEM, requestId: requestId };
}
