import React, { Component, PropTypes } from 'react'

export default class RequestDetails extends Component {
  componentWillMount() {
  }

  render() {
    const req = this.props.request;
    return (
      <div>{req.request.method} {req.request.protocol}://{req.request.host}{req.request.path}</div>
    )
  }
}

RequestDetails.propTypes = {
  request: PropTypes.object.isRequired
}
