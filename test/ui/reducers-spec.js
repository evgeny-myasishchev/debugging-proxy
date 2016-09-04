import Chance from 'chance';
import { expect } from 'chai';
import reducers from '../../app/ui/reducers';
import * as actions from '../../app/ui/actions';

const chance = new Chance();

describe('reducers', () => {
  const invoke = (state, action) => reducers(state, action);
  let initialState;

  beforeEach(() => {
    initialState = invoke(undefined, {});
  });

  describe('requests', () => {
    it('should return initial state', () => {
      expect(initialState.requests).to.eql({ entries: [], isFetching: false });
    });

    it('should handle fetch requests', () => {
      const action = { type: actions.FETCH_REQUESTS };
      initialState.requests.entries = [{ entry1: true }, { entry2: true }];
      const state = invoke(initialState, action);
      expect(state.requests.isFetching).to.eql(true);
      expect(state).not.to.eql(initialState);
      initialState.requests.isFetching = true;
      expect(state).to.eql(initialState);
    });

    it('should handle fetch success', () => {
      const entries = [{ entry1: true }, { entry2: true }];
      const action = { type: actions.FETCH_SUCCESS, response: entries };
      initialState.requests.isFetching = true;
      initialState.requests.entries = [{ dummy1: true }, { dummy2: true }];
      const state = invoke(initialState, action);
      expect(state.requests.isFetching).to.eql(false);
      expect(state.requests.entries).to.eql(entries);
      expect(state).not.to.eql(initialState);
      initialState.requests.isFetching = false;
      initialState.requests.entries = entries;
      expect(state).to.eql(initialState);
    });

    it('should sort request by startedAt date');

    it('should return state for unknown actions', () => {
      const action = { type: 'UNSUPPORTED-ACTION' };
      const dummyState = { prop1: chance.word(), prop2: chance.word() };
      const state = invoke({ requests: dummyState }, action);
      expect(state.requests).to.eql(dummyState);
    });

    describe('ADD_NEW_REQUEST', () => {
      it('should insert new request on top of requests', () => {
        const newRequest = { newReq: chance.word() };
        initialState.requests.entries = [{ req1: true }, { req2: true }];
        invoke(initialState, actions.addNewRequest(newRequest));
        expect(initialState.requests.entries.length).to.eql(3);
        expect(initialState.requests.entries[0]).to.eql(newRequest);
      });
    });

    describe('ADD_NEW_RESPONSE', () => {
      let req;
      let res;
      beforeEach(() => {
        const reqId = `req-id-${chance.word()}`;
        req = { _id: reqId };
        initialState.requests.entries = [
          { _id: `dummy-req-id-${chance.word()}` },
          req,
          { _id: `dummy-req-id-${chance.word()}` },
        ];
        res = {
          _id: reqId,
          completedAt: chance.date(),
          response: { dummy: `res-${chance.word()}` },
        };
      });
      it('should assign response data for corresponding reqeust', () => {
        invoke(initialState, actions.addNewResponse(res));
        expect(initialState.requests.entries.length).to.eql(3);
        expect(initialState.requests.entries[1].response).to.eql(res.response);
        expect(initialState.requests.entries[1].completedAt).to.eql(res.completedAt);
      });
    });
  });

  describe('errorMessage', () => {
    it('should return initial state', () => {
      expect(initialState.errorMessage).to.eql(null);
    });

    it('should return error if action has it', () => {
      const action = { error: chance.sentence() };
      const state = invoke(initialState, action);
      expect(state.errorMessage).to.eql(action.error);
    });

    it('should reset on reset action', () => {
      initialState.errorMessage = chance.sentence();
      const state = invoke(initialState, actions.resetErrorMessage());
      expect(state.errorMessage).to.eql(null);
    });

    it('should return state for unknown actions', () => {
      const action = { type: 'UNSUPPORTED-ACTION' };
      const dummyState = { prop1: chance.word(), prop2: chance.word() };
      const state = invoke({ errorMessage: dummyState }, action);
      expect(state.errorMessage).to.eql(dummyState);
    });
  });
});
