import _ from 'lodash';
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import RequestsList from '../../../app/ui/components/RequestsList.jsx';
import RequestListItem from '../../../app/ui/components/RequestListItem.jsx';
import chance from '../../support/chance';

describe('components RequestsList', () => {
  function setup(p) {
    const props = _.merge({
      requests: [],
      actions: {
        dummyAction1: chance.word(),
        dummyAction2: chance.word(),
      },
    }, p);

    const enzymeWrapper = shallow(<RequestsList {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  it('should render RequestListItem for each request', () => {
    const req1 = chance.data.savedRequest();
    const req2 = chance.data.savedRequest();
    const { enzymeWrapper, props } = setup({ requests: [req1, req2] });
    const listItems = enzymeWrapper.find('RequestListItem');
    expect(listItems.length).to.eql(2);
    expect(listItems.nodes[0].type).to.eql(RequestListItem);
    expect(listItems.nodes[0].props.request).to.eql(req1);
    expect(listItems.nodes[0].props.actions).to.eql(props.actions);
    expect(listItems.nodes[1].type).to.eql(RequestListItem);
    expect(listItems.nodes[1].props.request).to.eql(req2);
    expect(listItems.nodes[1].props.actions).to.eql(props.actions);
  });
});
