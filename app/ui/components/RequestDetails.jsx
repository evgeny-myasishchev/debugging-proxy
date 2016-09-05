import React, {Component, PropTypes} from 'react'

export default class RequestDetails extends Component {
  componentWillMount() {}

  render() {
    return (
      <div className='alert alert-info'>TODO: Request details will be here</div>
    )
  }
}

RequestDetails.propTypes = {
  request: PropTypes.object
}
