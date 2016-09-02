import _ from 'lodash';
import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { App } from '../../../app/ui/containers/App.jsx';
import chance from '../../support/chance';

describe('containers App', () => {
  function setup(p) {
    const props = _.merge({
      fetchRequests: sinon.spy(),
      requests: [],
      isFetching: false,
    }, p);

    const enzymeWrapper = shallow(<App {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  it('should render self and RequestsList if not fetching', () => {
    const req1 = chance.data.savedRequest();
    const req2 = chance.data.savedRequest();
    const { enzymeWrapper, props } = setup({ requests: [req1, req2] });
    const requestsList = enzymeWrapper.find('Connect(RequestsList)');
    expect(requestsList.props().requests).to.eql([req1, req2]);
    expect(props.fetchRequests).to.have.callCount(1);
  });

  it('should render loading if fetching', () => {
    const { enzymeWrapper } = setup({ isFetching: true });
    const loading = enzymeWrapper.find('div.tag.tag-info');
    expect(loading.length).to.eql(1);
    expect(loading.props().children).to.eql('Loading requests...');
  });
});
