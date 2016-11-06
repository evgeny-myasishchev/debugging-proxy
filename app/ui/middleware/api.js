import 'isomorphic-fetch'

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = Symbol('Call API');

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default (apiRoot) => () => next => action => {
  const callAPI = action[CALL_API]
  if (typeof callAPI === 'undefined') {
    return next(action);
  }

  const { endpoint, types } = callAPI

  if (typeof endpoint !== 'string') {
    throw new Error('Expected endpoint to be provided as string');
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types');
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings');
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data);
    delete finalAction[CALL_API];
    return finalAction;
  }

  const [ requestType, successType, failureType ] = types;
  next(actionWith({ type: requestType }));

  const fullUrl = (endpoint.indexOf(apiRoot) === -1) ? apiRoot + endpoint : endpoint;
  return fetch(fullUrl)
    .then(response => {
      if (!response.ok) {
        return Promise.reject(response);
      }
      if(response.headers.has('content-type') &&
        //can be "applicaiton/json; charset: utf-8"
        response.headers.get('content-type').startsWith('application/json')) {
        return response.json();
      }
      return response.text();
    })
    .then(response => {
      next(actionWith({
        response,
        type: successType
      }))
    })
    .catch(response => {
      const data = {
        statusCode : response.status,
        statusMessage : response.statusText
      };
      next(actionWith({
        type: failureType,
        error: data
      }))
    })
}
