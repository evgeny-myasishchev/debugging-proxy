import React, {Component, PropTypes} from 'react'

export default class RequestDetails extends Component {
  componentWillMount() {}

  render() {
    const { 
      request : { request } 
    } = this.props;
    const href = `${request.protocol}://${request.host}/${request.path}`
    return (
      <div className='card card-outline-primary'>
        <div className="card-block">
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">{request.method}</span>
            <input readOnly="true" type="text" className="form-control" aria-describedby="basic-addon1" value={href} />
          </div>
        </div>
      </div>
    )
  }
}

RequestDetails.propTypes = {
  request: PropTypes.object
}
