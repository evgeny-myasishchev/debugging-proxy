import _ from 'lodash';
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import RequestsList from '../../../app/ui/components/RequestsList.jsx';
import RequestDetails from '../../../app/ui/components/RequestDetails.jsx';
import chance from '../../support/chance';

describe('components RequestsList', () => {
  function setup(p) {
    const props = _.merge({
      requests: [],
    }, p);

    const enzymeWrapper = shallow(<RequestsList {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  it('should render RequestDetails for each request', () => {
    const req1 = chance.data.savedRequest();
    const req2 = chance.data.savedRequest();
    const { enzymeWrapper } = setup({ requests: [req1, req2] });
    const requestDetails = enzymeWrapper.find('RequestDetails');
    expect(requestDetails.length).to.eql(2);
    expect(requestDetails.nodes[0].type).to.eql(RequestDetails);
    expect(requestDetails.nodes[0].props.request).to.eql(req1);
    expect(requestDetails.nodes[1].type).to.eql(RequestDetails);
    expect(requestDetails.nodes[1].props.request).to.eql(req2);
  });
});
