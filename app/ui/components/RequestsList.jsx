import React, { Component, PropTypes } from 'react'
import RequestListItem from './RequestListItem.jsx'

export default class RequestsList extends Component {
  componentWillMount() {
  }
  
  getListItemState(req) {
    const { requestListItems } = this.props;
    return requestListItems[req._id] || null;
  }

  render() {
    const { requests, actions } = this.props;
    return (
      <table className='table table-sm table-hover'>
        <tbody>
          {requests.map(req => 
            <RequestListItem key={req._id} request={req} actions={actions} itemState={this.getListItemState(req)} />
          )}
        </tbody>
      </table>
    )
  }
}

RequestsList.propTypes = {
  requests: PropTypes.array.isRequired,
  requestListItems: PropTypes.object,
  actions: PropTypes.object.isRequired,
}
