import _ from 'lodash';
import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import api, { CALL_API } from '../../../app/ui/middleware/api';
import chance from '../../support/chance';

describe('ui middleware api', () => {
  const apiRoot = `http://api.${chance.word()}:${chance.integer({ min: 3000, max: 4000 })}`;
  const fn = api(apiRoot)();
  let next;

  const buildAction = (data) => {
    const random = chance.word();
    return {
      [CALL_API]: _.merge({
        types: [`REQ-${random}`, `REQ-SUCCESS-${random}`, `REQ-FAILURE-${random}`],
        endpoint: `/v1/${chance.word()}/${random}`,
      }, data),
    };
  };

  const actionData = () => ({
    prop1: chance.word(),
    prop2: chance.word(),
  });

  beforeEach(() => {
    next = sinon.spy();
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('should pass through non api actions', () => {
    const action = { dummyAction: chance.word() };
    fn(next)(action);
    expect(next).to.have.been.calledWith(action);
  });

  it('should raise error if endpoing is not defined', () => {
    const action = buildAction();
    delete action[CALL_API].endpoint;
    expect(() => fn(next)(action)).to.throw(Error, 'Expected endpoint to be provided as string');
  });

  it('should raise error if types are not defined', () => {
    const action = buildAction();
    delete action[CALL_API].types;
    expect(() => fn(next)(action)).to.throw(Error, 'Expected an array of three action types');
  });

  it('should raise error if types has other than 3 elements', () => {
    const action = buildAction();
    action[CALL_API].types = ['one', 'two'];
    expect(() => fn(next)(action)).to.throw(Error, 'Expected an array of three action types');
  });

  it('should raise error if types are not strings', () => {
    const action = buildAction();
    action[CALL_API].types = [true, false, false];
    expect(() => fn(next)(action)).to.throw(Error, 'Expected action types to be strings');
  });

  it('should imediately dispatch request action with action data', () => {
    fetchMock.mock('*', { status: 200, body: { data: 'fake' } });
    const action = buildAction(actionData());
    fn(next)(action);
    expect(next).to.have.been.calledWith(_.merge({
      type: action[CALL_API].types[0],
    }, action));
  });

  it('should fetch the data and dispatch success action with response', (done) => {
    const action = buildAction(actionData());
    const data = { fake: chance.word() };
    fetchMock.mock(`${apiRoot}${action[CALL_API].endpoint}`, { status: 200, body: data });
    fn(next)(action)
      .then(() => {
        expect(next).to.have.been.calledWith(_.merge({
          type: action[CALL_API].types[1],
          response: data,
        }, action));
      })
      .then(done)
      .catch(done);
  });

  it('should fetch the data and dispatch failure action on http error', (done) => {
    const action = buildAction(actionData());
    fetchMock.mock(`${apiRoot}${action[CALL_API].endpoint}`, { status: 500 });
    fn(next)(action)
      .then(() => {
        expect(next).to.have.been.calledWith(_.merge({
          type: action[CALL_API].types[2],
          error: { statusCode: 500, statusMessage: 'Internal Server Error' },
        }, action));
      })
      .then(done)
      .catch(done);
  });
});
