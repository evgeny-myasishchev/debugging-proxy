import { connect } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import React, { Component, PropTypes } from 'react'
import { fetchRequests } from '../actions'

class RequestsList extends Component {
  componentWillMount() {
    //TODO: Load 
  }

  render() {
    const requests = this.props.requests;
    return (
      <table>
        <tbody>
          {requests.map(req => 
            <tr key={req._id}>
              <td>{req.request.method} {req.request.protocol}://{req.request.host}{req.request.path}</td>
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

function mapStateToProps(state) {
  return {
    isFetching: state.requests.isFetching,
    requests: state.requests.entries
  }
}

export default connect(mapStateToProps, {
  fetchRequests,
})(RequestsList)
