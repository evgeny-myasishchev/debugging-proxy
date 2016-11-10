import _ from 'lodash';
import React, { Component, PropTypes } from 'react'
import RequestListItem from './RequestListItem.jsx'

export default class RequestsList extends Component {
  componentWillMount() {
  }

  getListItemState(req) {
    const { requestListItems } = this.props;
    return _.get(requestListItems, req._id, {});
  }

  render() {
    const { requests, actions } = this.props;
    return (
      requests.length ? (
        <ul className='list-group'>
          {requests.map(req =>
            <RequestListItem key={req._id} request={req} actions={actions} itemState={this.getListItemState(req)} />
          )}
        </ul>
      ) : (
        <div className="alert alert-info" role="alert">
          No requests captured yet
        </div>
      )
    )
  }
}

RequestsList.propTypes = {
  requests: PropTypes.array.isRequired,
  requestListItems: PropTypes.object,
  actions: PropTypes.object.isRequired,
}
