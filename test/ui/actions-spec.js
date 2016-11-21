import _ from 'lodash';
import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { CALL_API } from '../../app/ui/middleware/api';
import * as actions from '../../app/ui/actions';
import chance from '../support/chance';

function handleApiAction() {
  return (next) => (action) => {
    const callAPI = action[CALL_API];
    if (callAPI) {
      return next({ type: CALL_API, callAPI, original: action });
    }
    return next(action);
  };
}

const middlewares = [thunk, handleApiAction];
const mockStore = configureMockStore(middlewares);

describe('ui', () => {
  describe('actions', () => {
    describe('fetchRequests', () => {
      it('should despatch api action to fetch requests', () => {
        const store = mockStore({ });
        store.dispatch(actions.fetchRequests());
        expect(store.getActions().length).to.eql(1);
        const action = store.getActions()[0];
        expect(action.type).to.eql(CALL_API);
        expect(action.callAPI.types).to.eql([actions.FETCH_REQUESTS, actions.FETCH_SUCCESS, actions.FETCH_FAILURE]);
        expect(action.callAPI.endpoint).to.eql('/api/v1/requests');
      });
    });

    describe('fetchRequestBody', () => {
      it('should despatch api action to fetch single request body', () => {
        const req = chance.data.savedRequest();
        req.request.method = chance.pickone(['POST', 'PUT', 'DELETE']);
        const requestId = _.get(req, '_id');
        const store = mockStore({ });
        store.dispatch(actions.fetchRequestBody(req));
        expect(store.getActions().length).to.eql(1);
        const action = store.getActions()[0];
        expect(action.type).to.eql(CALL_API);
        expect(action.original.request).to.eql(req);
        expect(action.callAPI.types).to.eql([actions.FETCH_REQUEST_BODY, actions.FETCH_REQ_BODY_SUCCESS, actions.FETCH_REQ_BODY_FAILURE]);
        expect(action.callAPI.endpoint).to.eql(`/api/v1/requests/${requestId}`);
      });

      it('should despatch has no body action for get request', () => {
        const req = chance.data.savedRequest();
        req.request.method = 'GET';
        const store = mockStore({ });
        store.dispatch(actions.fetchRequestBody(req));
        expect(store.getActions().length).to.eql(1);
        const action = store.getActions()[0];
        expect(action).to.eql(actions.fetchRequestHasNoBody(req));
      });
    });

    describe('fetchRequestHasNoBody', () => {
      it('should create has no body action with given request', () => {
        const request = chance.data.savedRequest();
        const action = actions.fetchRequestHasNoBody(request);
        expect(action).to.eql({ type: actions.FETCH_REQ_HAS_NO_BODY, request });
      });
    });

    describe('fetchResponseBody', () => {
      it('should despatch api action to fetch single response body', () => {
        const req = chance.data.savedRequest();
        const requestId = _.get(req, '_id');
        const store = mockStore({ });
        store.dispatch(actions.fetchResponseBody(req));
        expect(store.getActions().length).to.eql(1);
        const action = store.getActions()[0];
        expect(action.type).to.eql(CALL_API);
        expect(action.original.request).to.eql(req);
        expect(action.callAPI.types).to.eql([actions.FETCH_RESPONSE_BODY, actions.FETCH_RES_BODY_SUCCESS, actions.FETCH_RES_BODY_FAILURE]);
        expect(action.callAPI.endpoint).to.eql(`/api/v1/requests/${requestId}/response`);
      });
    });

    describe('purgeRequests', () => {
      it('should despatch api action to purge requests', () => {
        const store = mockStore({ });
        store.dispatch(actions.purgeRequests());
        expect(store.getActions().length).to.eql(1);
        const action = store.getActions()[0];
        expect(action.type).to.eql(CALL_API);
        expect(action.callAPI.types).to.eql([actions.PURGE_REQUESTS, actions.PURGE_REQUESTS_SUCCESS, actions.PURGE_REQUESTS_FAILURE]);
        expect(action.callAPI.endpoint).to.eql('/api/v1/requests');
        expect(action.callAPI.method).to.eql('DELETE');
      });
    });

    describe('activateRequestDetailsTab', () => {
      it('should build activate request details tab for given request and tab', () => {
        const req = chance.data.savedRequest();
        const tab = chance.word();
        expect(actions.activateRequestDetailsTab(req, tab)).to.eql({
          type: actions.ACTIVATE_REQUEST_DETAILS_TAB,
          request: req,
          tab,
        });
      });
    });

    describe('resetErrorMessage', () => {
      it('should create reset error message action', () => {
        const action = actions.resetErrorMessage();
        expect(action.type).to.eql(actions.RESET_ERROR_MESSAGE);
      });
    });

    describe('addNewRequest', () => {
      it('should create add new request action', () => {
        const request = { dummy: chance.word() };
        expect(actions.addNewRequest(request)).to.eql({
          type: actions.ADD_NEW_REQUEST, request,
        });
      });
    });

    describe('addNewResponse', () => {
      it('should create add new request action', () => {
        const response = { dummy: chance.word() };
        expect(actions.addNewResponse(response)).to.eql({
          type: actions.ADD_NEW_RESPONSE, response,
        });
      });
    });

    describe('toggleRequestListItem', () => {
      it('should create toggle action for given request', () => {
        const request = { _id: `req-id-${chance.word()}` };
        expect(actions.toggleRequestListItem(request)).to.eql({
          type: actions.TOGGLE_REQUEST_LIST_ITEM, requestId: _.get(request, '_id'),
        });
      });

      it('should raise error if provided request does not have _id', () => {
        expect(() => actions.toggleRequestListItem({ dummy: true })).to.throw(Error, 'Provided request does not have an _id property');
      });
    });
  });
});
