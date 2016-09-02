import React, { Component, PropTypes } from 'react'
import RequestDetails from './RequestDetails.jsx'

export default class RequestsList extends Component {
  componentWillMount() {
  }

  render() {
    const requests = this.props.requests;
    return (
      <table>
        <tbody>
          {requests.map(req => 
            <tr key={req._id}>
              <td><RequestDetails request={req} /></td>
            </tr>
          )}
        </tbody>
      </table>
    )
  }
}

RequestsList.propTypes = {
  requests: PropTypes.array.isRequired
}
