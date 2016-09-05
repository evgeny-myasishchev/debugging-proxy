import _ from 'lodash';
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import RequestListItem from '../../../app/ui/components/RequestListItem.jsx';
import chance from '../../support/chance';

describe('components RequestListItem', () => {
  function setup(p) {
    const props = _.merge({
      request: chance.data.savedRequest(),
      actions: {
        dummyAction1: chance.word(),
        dummyAction2: chance.word(),
      },
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
    const button = enzymeWrapper.find('button');
    expect(button.text()).to.eql(`${request.protocol}://${request.host}${request.path}`);
  });
});
