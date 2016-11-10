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
      request: _.get(p, 'request', chance.data.savedRequest()),
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

  describe('response status code', () => {
    function renderComponent(statusCode) {
      const request = chance.data.savedRequest();
      request.response.statusCode = statusCode;
      const { enzymeWrapper } = setup({ request });
      return {
        response: request.response,
        element: enzymeWrapper.find('#response-status-code'),
      };
    }

    it('should not be rendered if no response', () => {
      const request = chance.data.savedRequest();
      delete request.response;
      const { enzymeWrapper } = setup({ request });
      expect(enzymeWrapper.find('#response-status-code').length).to.eql(0);
    });

    it('should be info for 1xx status', () => {
      const { response, element } = renderComponent(chance.integer({ min: 100, max: 199 }));
      expect(element.length).to.eql(1);
      expect(element.props().className).to.eql('tag tag-info');
      expect(element.text()).to.eql(`${response.statusCode} ${response.statusMessage}`);
    });

    it('should be success for 2xx status', () => {
      const { response, element } = renderComponent(chance.integer({ min: 200, max: 299 }));
      expect(element.length).to.eql(1);
      expect(element.props().className).to.eql('tag tag-success');
      expect(element.text()).to.eql(`${response.statusCode} ${response.statusMessage}`);
    });

    it('should be default for 3xx status', () => {
      const { response, element } = renderComponent(chance.integer({ min: 300, max: 399 }));
      expect(element.length).to.eql(1);
      expect(element.props().className).to.eql('tag tag-default');
      expect(element.text()).to.eql(`${response.statusCode} ${response.statusMessage}`);
    });

    it('should be warning for 4xx status', () => {
      const { response, element } = renderComponent(chance.integer({ min: 400, max: 499 }));
      expect(element.length).to.eql(1);
      expect(element.props().className).to.eql('tag tag-warning');
      expect(element.text()).to.eql(`${response.statusCode} ${response.statusMessage}`);
    });

    it('should be danger for 5xx status', () => {
      const { response, element } = renderComponent(chance.integer({ min: 500, max: 599 }));
      expect(element.length).to.eql(1);
      expect(element.props().className).to.eql('tag tag-danger');
      expect(element.text()).to.eql(`${response.statusCode} ${response.statusMessage}`);
    });
  });

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
