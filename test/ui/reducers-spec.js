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

    it('should return state for unknown actions', () => {
      const action = { type: 'UNSUPPORTED-ACTION' };
      const dummyState = { prop1: chance.word(), prop2: chance.word() };
      const state = invoke({ requests: dummyState }, action);
      expect(state.requests).to.eql(dummyState);
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
