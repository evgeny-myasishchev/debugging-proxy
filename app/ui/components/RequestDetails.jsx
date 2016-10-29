import React, {Component, PropTypes} from 'react'
import HttpHeaders from './HttpHeaders.jsx'

export default class RequestDetails extends Component {
  componentWillMount() {}

  render() {
    const {
      request: {
        request,
        response
      }
    } = this.props;
    const href = `${request.path}`
    return (
      <div className='card'>
        <div className="card-block">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" data-toggle="tab" href="#home" role="tab">Request</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#profile" role="tab">Respnse</a>
            </li>
          </ul>
          <div className="tab-content">
            <div className="tab-pane active" id="home" role="tabpanel">
              <form>
                <div className='form-group'>
                  <div className='alert alert-info'>{request.method} {href}</div>
                </div>
                <div className='form-group'>
                  <i>Headers</i>
                  <HttpHeaders headers={request.headers} />
                </div>
              </form>
            </div>
            <div className="tab-pane" id="profile" role="tabpanel">
              <i>Headers</i>
              <HttpHeaders headers={response.headers} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

RequestDetails.propTypes = {
  request: PropTypes.object
}
