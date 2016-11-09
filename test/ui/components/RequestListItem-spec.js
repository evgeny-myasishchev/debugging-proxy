import _ from 'lodash';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import RequestListItem from '../../../app/ui/components/RequestListItem.jsx';
import chance from '../../support/chance';

describe('components RequestListItem', () => {
  function setup(p) {
    const props = _.merge({
      request: chance.data.savedRequest(),
      itemState: { expanded: false },
      actions: {
        toggleRequestListItem: sinon.spy(),
      },
    }, p);

    const enzymeWrapper = shallow(<RequestListItem {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  describe('collapsed', () => {
    let { enzymeWrapper, props } = [null, null];

    beforeEach(() => {
      ({ enzymeWrapper, props } = setup());
    });

    it('should render RequestListItem', () => {
      const request = props.request.request;

      const span = enzymeWrapper.find('span.tag.tag-default');
      expect(span.text()).to.eql(request.method);

      const button = enzymeWrapper.find('button');
      expect(button.text()).to.contain(`${request.protocol}://${request.host}${request.path}`);
    });

    it('should apply standard row classes', () => {
      const div = enzymeWrapper.find('div.list-group-item');
      expect(div.length).to.eql(1);
      expect(div.node.props.className).to.eql('list-group-item');
    });

    it('should render right carret', () => {
      const i = enzymeWrapper.find('i.fa-lg.fa');
      expect(i.length).to.eql(1);
      expect(i.node.props.className).to.contain('fa-caret-right');
    });

    it('should invoke toggle action on button click', () => {
      const button = enzymeWrapper.find('button');
      button.props().onClick();
      expect(props.actions.toggleRequestListItem).to.have.been.calledWith(props.request);
    });
  });

  describe('expanded', () => {
    let { enzymeWrapper, props } = [null, null];

    beforeEach(() => {
      ({ enzymeWrapper, props } = setup({ itemState: { expanded: true } }));
    });

    it('should apply special row classes', () => {
      const div = enzymeWrapper.find('div.list-group-item');
      expect(div.length).to.eql(1);
      expect(div.node.props.className).to.contain('list-group-item-info');
    });

    it('should render down carret', () => {
      const i = enzymeWrapper.find('i.fa-lg.fa');
      expect(i.length).to.eql(1);
      expect(i.node.props.className).to.contain('fa-caret-down');
    });

    it('should render request details if expanded', () => {
      const requestDetails = enzymeWrapper.find('RequestDetails');
      expect(requestDetails.length).to.eql(1);
      expect(requestDetails.node.props).to.eql(props);
    });
  });
});
