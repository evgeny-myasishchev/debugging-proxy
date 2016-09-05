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
      actions: {
        selectRequest: sinon.spy(),
      },
      isSelected: false,
    }, p);

    const enzymeWrapper = shallow(<RequestListItem {...props} />);

    return {
      props,
      enzymeWrapper,
    };
  }

  it('should render RequestListItem for each request', () => {
    const { enzymeWrapper, props } = setup();
    const request = props.request.request;

    const tr = enzymeWrapper.find('tr');
    expect(tr.props().className).to.eql(null);

    const span = enzymeWrapper.find('span.tag.tag-default');
    expect(span.text()).to.eql(request.method);

    const button = enzymeWrapper.find('button');
    expect(button.text()).to.eql(`${request.protocol}://${request.host}${request.path}`);
  });

  it('should select request on button click', () => {
    const { enzymeWrapper, props } = setup();
    const button = enzymeWrapper.find('button');
    button.props().onClick();
    expect(props.actions.selectRequest).to.have.been.calledWith(props.request);
  });

  it('should add special class for selected item', () => {
    const { enzymeWrapper } = setup({ isSelected: true });
    const tr = enzymeWrapper.find('tr');
    expect(tr.props().className).to.eql('table-active');
  });
});
