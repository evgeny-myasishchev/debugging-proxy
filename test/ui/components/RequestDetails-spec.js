import _ from 'lodash';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import RequestDetails from '../../../app/ui/components/RequestDetails.jsx';
import chance from '../../support/chance';

describe('components RequestDetails', () => {
  function setup(p) {
    const props = _.merge({
      request: chance.data.savedRequest(),
      itemState: { },
      actions: {
        fetchRequestBody: sinon.spy(),
        fetchResponseBody: sinon.spy(),
      },
    }, p);

    const enzymeWrapper = shallow(<RequestDetails {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  it('should render request as active tab by default', () => {
    const { enzymeWrapper } = setup();
    const requestTab = enzymeWrapper.find('[href="#request"]');
    expect(requestTab.props().className).to.eql('nav-link active');

    const responseTab = enzymeWrapper.find('[href="#response"]');
    expect(responseTab.props().className).to.eql('nav-link');
  });

  it('should render request as active tab if set in state', () => {
    const { enzymeWrapper } = setup({ itemState: { activeTab: 'request' } });
    const requestTab = enzymeWrapper.find('[href="#request"]');
    expect(requestTab.props().className).to.eql('nav-link active');

    const responseTab = enzymeWrapper.find('[href="#response"]');
    expect(responseTab.props().className).to.eql('nav-link');
  });

  it('should render response as active tab if set in state', () => {
    const { enzymeWrapper } = setup({ itemState: { activeTab: 'response' } });
    const requestTab = enzymeWrapper.find('[href="#request"]');
    expect(requestTab.props().className).to.eql('nav-link');

    const responseTab = enzymeWrapper.find('[href="#response"]');
    expect(responseTab.props().className).to.eql('nav-link active');
  });

  describe('req', () => {
    it('should be rendered by default', () => {
      const { enzymeWrapper } = setup();
      expect(enzymeWrapper.find('[id="request"]').length).to.eql(1);
    });

    it('should be rendered if activeTab is request', () => {
      const { enzymeWrapper } = setup({ itemState: { activeTab: 'request' } });
      expect(enzymeWrapper.find('[id="request"]').length).to.eql(1);
    });

    it('should not be rendered if activeTab is response', () => {
      const { enzymeWrapper } = setup({ itemState: { activeTab: 'response' } });
      expect(enzymeWrapper.find('[id="request"]').length).to.eql(0);
    });

    it('should fetch request body', () => {
      const { props } = setup();
      expect(props.actions.fetchRequestBody).to.have.callCount(1);
      expect(props.actions.fetchRequestBody).to.have.been.calledWith(props.request);
    });

    it('should not fetch request body if no request body', () => {
      const { props } = setup({ itemState: { req: { hasNoBody: true } } });
      expect(props.actions.fetchRequestBody).to.have.callCount(0);
    });

    it('should not fetch request body if already fetched', () => {
      const { props } = setup({ itemState: { req: { bodyFetched: true } } });
      expect(props.actions.fetchRequestBody).to.have.callCount(0);
    });

    it('should not render request body if no request state', () => {
      const { enzymeWrapper } = setup();
      expect(enzymeWrapper.find('[id="request"] HttpBody').length).to.eql(0);
      expect(enzymeWrapper.find('[id="request"] h4.card-title').length).to.eql(1);
    });

    it('should not render request body if has no body', () => {
      const { enzymeWrapper } = setup({ itemState: { req: { hasNoBody: true } } });
      expect(enzymeWrapper.find('[id="request"] HttpBody').length).to.eql(0);
      expect(enzymeWrapper.find('[id="request"] h4.card-title').length).to.eql(1);
    });

    it('should render request body if has body', () => {
      const reqState = { hasNoBody: false, dummy: new Date() };
      const { enzymeWrapper } = setup({ itemState: { req: reqState } });
      const httpBody = enzymeWrapper.find('[id="request"] HttpBody');
      expect(httpBody.length).to.eql(1);
      expect(httpBody.props()).to.eql({ state: reqState });
    });
  });

  describe('res', () => {
    it('should be rendered if activeTab is response', () => {
      const { enzymeWrapper } = setup({ itemState: { activeTab: 'response' } });
      expect(enzymeWrapper.find('[id="response"]').length).to.eql(1);
    });

    it('should not be rendered if activeTab is request', () => {
      const { enzymeWrapper } = setup({ itemState: { activeTab: 'request' } });
      expect(enzymeWrapper.find('[id="response"]').length).to.eql(0);
    });

    it('should fetch response body', () => {
      const { props } = setup({ itemState: { activeTab: 'response' } });
      expect(props.actions.fetchResponseBody).to.have.callCount(1);
      expect(props.actions.fetchResponseBody).to.have.been.calledWith(props.request);
    });

    it('should not fetch response body if already fetched', () => {
      const { props } = setup({ itemState: { res: { bodyFetched: true } } });
      expect(props.actions.fetchResponseBody).to.have.callCount(0);
    });

    it('should not render response body if no response state', () => {
      const { enzymeWrapper } = setup();
      expect(enzymeWrapper.find('HttpBody').length).to.eql(0);
      expect(enzymeWrapper.find('h4.card-title').length).to.eql(1);
    });

    it('should render response body', () => {
      const resState = { hasNoBody: false, dummy: new Date() };
      const { enzymeWrapper } = setup({ itemState: { activeTab: 'response', res: resState } });
      const httpBody = enzymeWrapper.find('[id="response"] HttpBody');
      expect(httpBody.length).to.eql(1);
      expect(httpBody.props()).to.eql({ state: resState });
      expect(enzymeWrapper.find('h4.card-title').length).to.eql(2);
    });
  });
});
