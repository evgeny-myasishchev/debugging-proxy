import _ from 'lodash';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import HttpBody from '../../../app/ui/components/HttpBody.jsx';
import chance from '../../support/chance';

describe('components HttpBody', () => {
  function setup(p) {
    const props = _.merge({
      request: chance.data.savedRequest(),
      state: { },
      actions: {
        fetchBody: sinon.spy(),
      },
    }, p);

    const enzymeWrapper = shallow(<HttpBody {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  it('should fetch if not yet fetched', () => {
    const {
      props: { request, actions: { fetchBody } },
    } = setup();
    expect(fetchBody).to.have.been.calledWith(request);
  });

  it('should not fetch if already fetched', () => {
    const {
      props: { actions: { fetchBody } },
    } = setup({ state: { bodyFetched: true } });
    expect(fetchBody).to.have.callCount(0);
  });

  it('should not fetch if has no body', () => {
    const {
      props: { actions: { fetchBody } },
    } = setup({ state: { hasNoBody: true } });
    expect(fetchBody).to.have.callCount(0);
  });

  it('should not fetch if fetching', () => {
    const {
      props: { actions: { fetchBody } },
    } = setup({ state: { isFetchingBody: true } });
    expect(fetchBody).to.have.callCount(0);
  });

  it('should show progress if fetching', () => {
    const { enzymeWrapper } = setup({ state: { isFetchingBody: true } });
    const progress = enzymeWrapper.find('#body-fetching-progress');
    expect(progress.length).to.eql(1);
  });

  it('should render body if fetched', () => {
    const body = chance.sentence();
    const { enzymeWrapper } = setup({ state: { body } });
    const bodyContents = enzymeWrapper.find('#body-contents');
    expect(bodyContents.length).to.eql(1);
    expect(bodyContents.text()).to.eql(body);
  });
});
