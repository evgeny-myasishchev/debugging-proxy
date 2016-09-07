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

  it('should render RequestListItem', () => {
    const { enzymeWrapper, props } = setup();
    const request = props.request.request;

    const span = enzymeWrapper.find('span.tag.tag-default');
    expect(span.text()).to.eql(request.method);

    const button = enzymeWrapper.find('button');
    expect(button.text()).to.eql(`${request.protocol}://${request.host}${request.path}`);
  });

  it('should invoke toggle action on button click', () => {
    const { enzymeWrapper, props } = setup();
    const button = enzymeWrapper.find('button');
    button.props().onClick();
    expect(props.actions.toggleRequestListItem).to.have.been.calledWith(props.request);
  });
});
