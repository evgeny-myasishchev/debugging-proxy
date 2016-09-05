import React, { Component, PropTypes } from 'react'
import RequestListItem from './RequestListItem.jsx'

export default class RequestsList extends Component {
  componentWillMount() {
  }

  render() {
    const { requests, selectedRequest, actions } = this.props;
    const isSelected = (req) => !!(selectedRequest && req._id === selectedRequest._id);
    return (
      <table className='table table-sm table-hover'>
        <tbody>
          {requests.map(req => 
            <RequestListItem key={req._id} request={req} actions={actions} isSelected={isSelected(req)} />
          )}
        </tbody>
      </table>
    )
  }
}

RequestsList.propTypes = {
  requests: PropTypes.array.isRequired,
  selectedRequest: PropTypes.object,
  actions: PropTypes.object.isRequired,
}
