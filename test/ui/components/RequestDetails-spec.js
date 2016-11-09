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
      },
    }, p);

    const enzymeWrapper = shallow(<RequestDetails {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  describe('req body', () => {
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
      expect(enzymeWrapper.find('HttpBody').length).to.eql(0);
      expect(enzymeWrapper.find('h4.card-title').length).to.eql(1);
    });

    it('should not render request body if has no body', () => {
      const { enzymeWrapper } = setup({ itemState: { req: { hasNoBody: true } } });
      expect(enzymeWrapper.find('HttpBody').length).to.eql(0);
      expect(enzymeWrapper.find('h4.card-title').length).to.eql(1);
    });

    it('should render request body if has body', () => {
      const reqState = { hasNoBody: false, dummy: new Date() };
      const { enzymeWrapper } = setup({ itemState: { req: reqState } });
      const httpBody = enzymeWrapper.find('HttpBody');
      expect(httpBody.length).to.eql(1);
      expect(httpBody.props()).to.eql({ state: reqState });
      expect(enzymeWrapper.find('h4.card-title').length).to.eql(2);
    });
  });
});
