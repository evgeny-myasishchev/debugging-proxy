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
      return next({ type: CALL_API, original: callAPI });
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
        expect(action.original.types).to.eql([actions.FETCH_REQUESTS, actions.FETCH_SUCCESS, actions.FETCH_FAILURE]);
        expect(action.original.endpoint).to.eql('/api/v1/requests');
      });
    });

    describe('fetchRequestBody', () => {
      it('should despatch api action to fetch single request body', () => {
        const requestId = chance.guid();
        const store = mockStore({ });
        store.dispatch(actions.fetchRequestBody(requestId));
        expect(store.getActions().length).to.eql(1);
        const action = store.getActions()[0];
        expect(action.type).to.eql(CALL_API);
        expect(action.original.types).to.eql([actions.FETCH_REQUEST_BODY, actions.FETCH_REQ_BODY_SUCCESS, actions.FETCH_REQ_BODY_FAILURE]);
        expect(action.original.endpoint).to.eql(`/api/v1/requests/${requestId}`);
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
