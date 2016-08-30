import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import * as actions from '../../app/ui/actions';
import { CALL_API } from '../../app/ui/middleware/api';

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
        const store = mockStore({ todos: [] });
        store.dispatch(actions.fetchRequests());
        expect(store.getActions().length).to.eql(1);
        const action = store.getActions()[0];
        expect(action.type).to.eql(CALL_API);
        expect(action.original.types).to.eql([actions.FETCH_REQUESTS, actions.FETCH_SUCCESS, actions.FETCH_FAILURE]);
        expect(action.original.endpoint).to.eql('/api/v1/requests');
      });
    });

    describe('resetErrorMessage', () => {
      it('should create reset error message action', () => {
        const action = actions.resetErrorMessage();
        expect(action.type).to.eql(actions.RESET_ERROR_MESSAGE);
      });
    });
  });
});
