import { expect } from 'chai';
import EventEmitter from 'events';
import sinon from 'sinon';
import { handleMessages } from '../../app/ui/socketClient';
import chance from '../support/chance';
import * as actions from '../../app/ui/actions';

describe('ui socketClient', () => {
  const socket = new EventEmitter();

  let store;

  beforeEach(() => {
    store = {
      dispatch: sinon.spy(),
    };
    handleMessages(socket, store);
  });

  afterEach(() => {
    socket.removeAllListeners();
  });

  it('should dispatch add new request on reqeust-saved', () => {
    const req = { dummy: `req-${chance.word()}` };
    socket.emit('request-saved', req);
    expect(store.dispatch).to.have.been.calledWith(actions.addNewRequest(req));
  });

  it('should dispatch add new response on response-saved', () => {
    const res = { dummy: `res-${chance.word()}` };
    socket.emit('response-saved', res);
    expect(store.dispatch).to.have.been.calledWith(actions.addNewResponse(res));
  });
});
