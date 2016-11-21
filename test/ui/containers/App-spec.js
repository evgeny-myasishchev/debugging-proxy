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
      }, p),
      actions: {
        purgeRequests: sinon.spy(),
        fetchRequests: sinon.spy(),
      },
      requestListItems: { dummy: chance.word() },
    };

    const enzymeWrapper = shallow(<App {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  it('should fetch requests', () => {
    const { props } = setup({ entries: [] });
    expect(props.actions.fetchRequests).to.have.callCount(1);
  });

  it('should not fetch requests if there are entries available', () => {
    const { props } = setup({ entries: [chance.data.savedRequest(), chance.data.savedRequest()] });
    expect(props.actions.fetchRequests).to.have.callCount(0);
  });

  it('should render RequestsList if not fetching', () => {
    const req1 = chance.data.savedRequest();
    const req2 = chance.data.savedRequest();
    const { enzymeWrapper, props } = setup({ entries: [req1, req2] });
    const requestsList = enzymeWrapper.find('RequestsList');
    expect(requestsList.props().requests).to.eql([req1, req2]);
    expect(requestsList.props().actions).to.eql(props.actions);
    expect(requestsList.props().requestListItems).to.eql(props.requestListItems);
  });

  it('should render loading if fetching', () => {
    const { enzymeWrapper } = setup({ isFetching: true });
    const loading = enzymeWrapper.find('div.tag.tag-info');
    expect(loading.length).to.eql(1);
    expect(loading.props().children).to.eql('Loading requests...');
  });

  describe('purgeRequests', () => {
    it('should purge requests on purge button click', () => {
      const { props, enzymeWrapper } = setup();
      const btn = enzymeWrapper.find('[id="btnPurgeRequests"]');
      btn.props().onClick();
      expect(btn.props().disabled).to.be.an('undefined');
      expect(props.actions.fetchRequests).to.have.callCount(1);
    });

    it('should render progress if purging', () => {
      const { enzymeWrapper } = setup({ isPurging: true });
      const btn = enzymeWrapper.find('[id="btnPurgeRequests"]');
      expect(btn.text()).to.eql('Purging requests...');
      expect(btn.props().disabled).to.eql(true);
    });
  });
});
