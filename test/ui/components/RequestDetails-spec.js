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
      request: _.get(p, 'request', chance.data.savedRequest()),
      itemState: { },
      actions: {
        fetchRequestBody: sinon.spy(),
        fetchResponseBody: sinon.spy(),
        activateRequestDetailsTab: sinon.spy(),
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

  it('should invoke activate tab action on request tab click', () => {
    const { props, enzymeWrapper } = setup({ itemState: { activatTab: 'response' } });
    const requestTab = enzymeWrapper.find('[href="#request"]');
    requestTab.props().onClick({ preventDefault: sinon.spy() });
    expect(props.actions.activateRequestDetailsTab).to.have.been.calledWith(props.request, 'request');
  });

  it('should render response as active tab if set in state', () => {
    const { enzymeWrapper } = setup({ itemState: { activeTab: 'response' } });
    const requestTab = enzymeWrapper.find('[href="#request"]');
    expect(requestTab.props().className).to.eql('nav-link');

    const responseTab = enzymeWrapper.find('[href="#response"]');
    expect(responseTab.props().className).to.eql('nav-link active');
  });

  it('should render response as disabled and not active tab if no response', () => {
    const request = chance.data.savedRequest();
    delete request.response;
    const { enzymeWrapper } = setup({ request, itemState: { activeTab: 'response' } });
    const requestTab = enzymeWrapper.find('[href="#request"]');
    expect(requestTab.props().className).to.eql('nav-link active');

    const responseTab = enzymeWrapper.find('[href="#response"]');
    expect(responseTab.props().className).to.eql('nav-link disabled');
  });

  it('should invoke activate tab action on response tab click', () => {
    const { props, enzymeWrapper } = setup({ itemState: { activatTab: 'request' } });
    const requestTab = enzymeWrapper.find('[href="#response"]');
    requestTab.props().onClick({ preventDefault: sinon.spy() });
    expect(props.actions.activateRequestDetailsTab).to.have.been.calledWith(props.request, 'response');
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

    it('should not render request body if has no body', () => {
      const { enzymeWrapper } = setup({ itemState: { req: { hasNoBody: true } } });
      expect(enzymeWrapper.find('[id="request"] HttpBody').length).to.eql(0);
      expect(enzymeWrapper.find('[id="request"] h4.card-title').length).to.eql(1);
    });

    it('should render request body if has body', () => {
      const reqState = { dummy: new Date() };
      const {
        enzymeWrapper,
        props: {
          request, actions: { fetchRequestBody },
        },
      } = setup({ itemState: { req: reqState } });
      const httpBody = enzymeWrapper.find('[id="request"] HttpBody');
      expect(httpBody.length).to.eql(1);
      expect(httpBody.props()).to.eql({
        request,
        state: reqState,
        actions: { fetchBody: fetchRequestBody },
      });
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

    it('should render response body', () => {
      const resState = { dummy: new Date() };
      const {
        enzymeWrapper,
        props: {
          request, actions: { fetchResponseBody },
        },
      } = setup({ itemState: { activeTab: 'response', res: resState } });
      const httpBody = enzymeWrapper.find('[id="response"] HttpBody');
      expect(httpBody.length).to.eql(1);
      expect(httpBody.props()).to.eql({
        request,
        state: resState,
        actions: { fetchBody: fetchResponseBody },
      });
    });
  });
});
