import React, { Component, PropTypes } from 'react'
import RequestListItem from './RequestListItem.jsx'

export default class RequestsList extends Component {
  componentWillMount() {
  }

  render() {
    const { requests, actions } = this.props;
    const tableStyle = {
      
    }
    return (
      <table className='table table-sm table-hover' style={tableStyle}>
        <tbody>
          {requests.map(req => 
            <RequestListItem key={req._id} request={req} actions={actions} />
          )}
        </tbody>
      </table>
    )
  }
}

RequestsList.propTypes = {
  requests: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
}
