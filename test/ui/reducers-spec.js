import { expect } from 'chai';
import * as _ from 'lodash';
import Chance from 'chance';
import reducers from '../../app/ui/reducers';
import * as actions from '../../app/ui/actions';

const chance = new Chance();

describe('reducers', () => {
  const invoke = (state, action) => reducers(state, action);
  let initialState;

  beforeEach(() => {
    initialState = invoke(undefined, {});
  });

  const reqEntry = () => {
    const random = chance.word();
    return {
      _id: `req-id-${random}`,
      startedAt: chance.date(),
      completedAt: chance.date(),
      request: {
        dummyReq: `${random}`,
      },
      response: {
        dummyRes: `${random}`,
      },
    };
  };

  describe('requests', () => {
    it('should return initial state', () => {
      expect(initialState.requests).to.eql({
        entries: [],
        isFetching: false,
      });
    });

    describe('FETCH_REQUESTS', () => {
      it('should handle fetch requests', () => {
        const action = { type: actions.FETCH_REQUESTS };
        initialState.requests.entries = [reqEntry(), reqEntry()];
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
        initialState.requests.entries = [reqEntry(), reqEntry()];
        const state = invoke(initialState, action);
        expect(state.requests.isFetching).to.eql(false);
        expect(state.requests.entries).to.eql(entries);
        expect(state).not.to.eql(initialState);
        initialState.requests.isFetching = false;
        initialState.requests.entries = entries;
        expect(state).to.eql(initialState);
      });

      it('should sort request by startedAt date', () => {
        const req1 = reqEntry();
        const req2 = reqEntry();
        const req3 = reqEntry();
        const entries = [req1, req2, req3];
        const action = { type: actions.FETCH_SUCCESS, response: entries };
        const state = invoke(initialState, action);
        const ordered = _.orderBy(entries, 'startedAt', 'desc');
        expect(state.requests.entries).to.eql(ordered);
      });
    });

    describe('ADD_NEW_REQUEST', () => {
      it('should insert new request on top of requests', () => {
        const newRequest = reqEntry();
        initialState.requests.entries = [reqEntry(), reqEntry()];
        const state = invoke(initialState, actions.addNewRequest(newRequest));
        expect(state.requests.entries.length).to.eql(3);
        expect(state.requests.entries[0]).to.eql(newRequest);
      });
    });

    describe('ADD_NEW_RESPONSE', () => {
      let req;
      let res;
      beforeEach(() => {
        const reqId = `req-id-${chance.word()}`;
        req = { _id: reqId };
        initialState.requests.entries = [
          reqEntry(),
          req,
          reqEntry(),
        ];
        res = {
          _id: reqId,
          completedAt: chance.date(),
          response: { dummy: `res-${chance.word()}` },
        };
      });
      it('should assign response data for corresponding reqeust', () => {
        const state = invoke(initialState, actions.addNewResponse(res));
        expect(state.requests.entries.length).to.eql(3);
        expect(state.requests.entries[1].response).to.eql(res.response);
        expect(state.requests.entries[1].completedAt).to.eql(res.completedAt);
      });
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

  describe('requestListItems', () => {
    let req1;
    let req2;

    beforeEach(() => {
      [req1, req2] = [reqEntry(), reqEntry()];
    });

    it('should create initial empty state', () => {
      expect(initialState.requestListItems).to.eql({});
    });

    it('should return unmodified state for unknown action', () => {
      _.merge(initialState.requestListItems, { dummy: true });
      const state = invoke(initialState, { type: 'UNKNOWN' });
      expect(state.requestListItems).to.eql({ dummy: true });
    });

    describe('TOGGLE_REQUEST_LIST_ITEM', () => {
      it('should set expanded flag for given requestId to true if it was not set', () => {
        let state = invoke(initialState, actions.toggleRequestListItem(req1));
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: { expanded: true },
        });
        state = invoke(state, actions.toggleRequestListItem(req2));
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: { expanded: true },
          [_.get(req2, '_id')]: { expanded: true },
        });
      });

      it('should set expanded flag for given requestId to true if it was false', () => {
        _.merge(initialState.requestListItems, {
          [_.get(req1, '_id')]: { expanded: false },
          [_.get(req2, '_id')]: { expanded: false },
        });
        let state = invoke(initialState, actions.toggleRequestListItem(req1));
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: { expanded: true },
          [_.get(req2, '_id')]: { expanded: false },
        });
        state = invoke(state, actions.toggleRequestListItem(req2));
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: { expanded: true },
          [_.get(req2, '_id')]: { expanded: true },
        });
      });

      it('should set expanded flag for given reqeust to false if it was true', () => {
        _.merge(initialState.requestListItems, {
          [_.get(req1, '_id')]: { expanded: true },
          [_.get(req2, '_id')]: { expanded: true },
        });
        let state = invoke(initialState, actions.toggleRequestListItem(req1));
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: { expanded: false },
          [_.get(req2, '_id')]: { expanded: true },
        });
        state = invoke(state, actions.toggleRequestListItem(req2));
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: { expanded: false },
          [_.get(req2, '_id')]: { expanded: false },
        });
      });
    });

    describe('ACTIVATE_REQUEST_DETAILS_TAB', () => {
      it('should set activatTab for given request', () => {
        const tab1 = `tab-${chance.word()}`;
        const tab2 = `tab-${chance.word()}`;
        let state = invoke(initialState, actions.activateRequestDetailsTab(req1, tab1));
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: { activeTab: tab1 },
        });
        state = invoke(state, actions.activateRequestDetailsTab(req2, tab2));
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: { activeTab: tab1 },
          [_.get(req2, '_id')]: { activeTab: tab2 },
        });
      });
    });

    describe('fetch req body', () => {
      it('should set isFetchingBody to true when fetching', () => {
        const state = invoke(initialState, { type: actions.FETCH_REQUEST_BODY, request: req1 });
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: {
            req: { isFetchingBody: true, hasNoBody: false },
          },
        });
      });

      it('should set isFetchingBody to false and body on fetch success', () => {
        const body = chance.sentence();
        const reqId = _.get(req1, '_id');
        _.set(initialState, `requestListItems[${reqId}]`, { req: { isFetchingBody: true, hasNoBody: false } });
        const state = invoke(initialState, { type: actions.FETCH_REQ_BODY_SUCCESS, request: req1, response: body });
        expect(state.requestListItems).to.eql({
          [reqId]: {
            req: { isFetchingBody: false, bodyFetched: true, hasNoBody: false, body },
          },
        });
      });

      it('should set isFetchingBody to false and reason on fetch failure', () => {
        const reason = {
          statusCode: `status-${chance.word()}`,
          statusMessage: `status-msg-${chance.word()}`,
        };
        const reqId = _.get(req1, '_id');
        _.set(initialState, `requestListItems[${reqId}]`, { req: { isFetchingBody: true, hasNoBody: false } });
        const state = invoke(initialState, { type: actions.FETCH_REQ_BODY_FAILURE, request: req1, error: reason });
        expect(state.requestListItems).to.eql({
          [reqId]: {
            req: { isFetchingBody: false, bodyFetched: false, hasNoBody: false, reason },
          },
        });
      });

      it('should set isFetchingBody to false and hasNoBody to true if has no body', () => {
        const state = invoke(initialState, actions.fetchRequestHasNoBody(req1));
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: {
            req: { isFetchingBody: false, hasNoBody: true },
          },
        });
      });
    });

    describe('fetch res body', () => {
      it('should set isFetchingBody to true when fetching', () => {
        const state = invoke(initialState, { type: actions.FETCH_RESPONSE_BODY, request: req1 });
        expect(state.requestListItems).to.eql({
          [_.get(req1, '_id')]: {
            res: { isFetchingBody: true },
          },
        });
      });

      it('should set isFetchingBody to false and body on fetch success', () => {
        const body = chance.sentence();
        const reqId = _.get(req1, '_id');
        _.set(initialState, `requestListItems[${reqId}]`, { res: { isFetchingBody: true } });
        const state = invoke(initialState, { type: actions.FETCH_RES_BODY_SUCCESS, request: req1, response: body });
        expect(state.requestListItems).to.eql({
          [reqId]: {
            res: { isFetchingBody: false, bodyFetched: true, body },
          },
        });
      });

      it('should set isFetchingBody to false and reason on fetch failure', () => {
        const reason = {
          statusCode: `status-${chance.word()}`,
          statusMessage: `status-msg-${chance.word()}`,
        };
        const reqId = _.get(req1, '_id');
        _.set(initialState, `requestListItems[${reqId}]`, { res: { isFetchingBody: true } });
        const state = invoke(initialState, { type: actions.FETCH_RES_BODY_FAILURE, request: req1, error: reason });
        expect(state.requestListItems).to.eql({
          [reqId]: {
            res: { isFetchingBody: false, bodyFetched: false, reason },
          },
        });
      });
    });
  });
});
