import _ from 'lodash';
import { expect } from 'chai';
import sinon from 'sinon';
import api, { CALL_API } from '../../../app/ui/middleware/api';
import chance from '../../support/chance';

describe('ui middleware api', () => {
  const fn = api();
  let next;

  const buildAction = (data) => ({
    [CALL_API]: _.merge({
      types: [`REQ-${chance.word()}`, `REQ-SUCCESS-${chance.word()}`, `REQ-FAILURE-${chance.word()}`],
      endpoint: `/v1/${chance.word()}/${chance.word()}`,
    }, data),
  });

  beforeEach(() => {
    next = sinon.spy();
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

  });

  it('should fetch the data and dispatch success action with response', (done) => {
    done();
  });

  it('should fetch the data and dispatch failure action on error', (done) => {
    done();
  });
});
