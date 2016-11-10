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
      requestListItems: {},
    }, p);

    const enzymeWrapper = shallow(<RequestsList {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  it('should render no requests message if there are no requests yet', () => {
    const { enzymeWrapper } = setup({ requests: [] });
    expect(enzymeWrapper.find('RequestListItem').length).to.eql(0);
    expect(enzymeWrapper.find('ul.list-group').length).to.eql(0);
    const alert = enzymeWrapper.find('div.alert-info');
    expect(alert.length).to.eql(1);
    expect(alert.text()).to.contain('No requests');
  });

  it('should render RequestListItem for each request', () => {
    const req1 = chance.data.savedRequest();
    const req2 = chance.data.savedRequest();
    const { enzymeWrapper, props } = setup({ requests: [req1, req2] });
    const listItems = enzymeWrapper.find('RequestListItem');
    expect(listItems.length).to.eql(2);
    expect(listItems.nodes[0].type).to.eql(RequestListItem);
    expect(listItems.nodes[0].props.request).to.eql(req1);
    expect(listItems.nodes[0].props.actions).to.eql(props.actions);
    expect(listItems.nodes[0].props.itemState).to.eql({});
    expect(listItems.nodes[1].type).to.eql(RequestListItem);
    expect(listItems.nodes[1].props.request).to.eql(req2);
    expect(listItems.nodes[1].props.actions).to.eql(props.actions);
    expect(listItems.nodes[1].props.itemState).to.eql({});
  });

  it('should render RequestListItem with itemState', () => {
    const req1 = chance.data.savedRequest();
    const req1State = { dummyState: `req1-list-item-state-${chance.word()}` };
    const req2 = chance.data.savedRequest();
    const req2State = { dummyState: `req2-list-item-state-${chance.word()}` };
    const req3 = chance.data.savedRequest();
    const req3State = { dummyState: `req3-list-item-state-${chance.word()}` };
    const { enzymeWrapper } = setup({
      requests: [req1, req2, req3],
      requestListItems: {
        [_.get(req1, '_id')]: req1State,
        [_.get(req2, '_id')]: req2State,
        [_.get(req3, '_id')]: req3State,
      },
    });
    const listItems = enzymeWrapper.find('RequestListItem');
    expect(listItems.length).to.eql(3);
    expect(listItems.nodes[0].type).to.eql(RequestListItem);
    expect(listItems.nodes[0].props.itemState).to.eql(req1State);

    expect(listItems.nodes[1].type).to.eql(RequestListItem);
    expect(listItems.nodes[1].props.itemState).to.eql(req2State);

    expect(listItems.nodes[2].type).to.eql(RequestListItem);
    expect(listItems.nodes[2].props.itemState).to.eql(req3State);
  });
});
