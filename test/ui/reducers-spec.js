import { expect } from 'chai';
import reducers from '../../app/ui/reducers';
import * as actions from '../../app/ui/actions';

describe('reducers', () => {
  describe('requests', () => {
    const invoke = (state, action) => reducers(state, action);
    let initialState;

    beforeEach(() => {
      initialState = invoke(undefined, {});
    });

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
  });
});
