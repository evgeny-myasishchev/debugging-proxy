import _ from 'lodash';
import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { App } from '../../../app/ui/containers/App.jsx';
import chance from '../../support/chance';

describe('containers App', () => {
  function setup(p) {
    const props = {
      requests: _.merge({
        entries: [],
        isFetching: false,
        selectedRequest: null,
      }, p),
      actions: {
        fetchRequests: sinon.spy(),
      },
    };

    const enzymeWrapper = shallow(<App {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  it('should render self and RequestsList if not fetching', () => {
    const req1 = chance.data.savedRequest();
    const req2 = chance.data.savedRequest();
    const { enzymeWrapper, props } = setup({ entries: [req1, req2] });
    const requestsList = enzymeWrapper.find('RequestsList');
    expect(requestsList.props().requests).to.eql([req1, req2]);
    expect(requestsList.props().actions).to.eql(props.actions);
    expect(props.actions.fetchRequests).to.have.callCount(1);
  });

  it('should render loading if fetching', () => {
    const { enzymeWrapper } = setup({ isFetching: true });
    const loading = enzymeWrapper.find('div.tag.tag-info');
    expect(loading.length).to.eql(1);
    expect(loading.props().children).to.eql('Loading requests...');
  });

  it('should render RequestDetails with selected request', () => {
    const req1 = chance.data.savedRequest();
    const { enzymeWrapper } = setup({ selectedRequest: req1 });
    const requestDetails = enzymeWrapper.find('RequestDetails');
    expect(requestDetails.props().request).to.eql(req1);
  });
});
