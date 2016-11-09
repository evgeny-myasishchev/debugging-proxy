import _ from 'lodash';
import React, {Component, PropTypes} from 'react'
import HttpBody from './HttpBody.jsx'
import HttpHeaders from './HttpHeaders.jsx'

export default class RequestDetails extends Component {
  componentWillMount() {
    const {
      itemState,
      request,
      actions : { fetchRequestBody }
    } = this.props;

    if(!_.get(itemState, 'req.hasNoBody', false) && !_.get(itemState, 'req.bodyFetched', false)) {
      fetchRequestBody(request);
    }
  }

  renderRequestBody() {
    const {
      itemState
    } = this.props;
    if(!_.has(itemState, 'req')) return false;
    if(_.get(itemState, 'req.hasNoBody', true)) return false;
    const reqState = itemState.req;
    return (
      <div>
        <h4 className='card-title'>Body</h4>
        <div className='card card-outline-secondary'>
          <HttpBody state={reqState} />
        </div>
      </div>
    )
  }

  render() {
    const {
      request: {
        request,
        // response
      }
    } = this.props;
    return (
      <div className='card'>
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs float-xs-left" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" data-toggle="tab" href="#request-details" role="tab">Request</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#response-details" role="tab">Respnse</a>
            </li>
          </ul>
        </div>
        <div className="card-block">
          <div id="request-details" role="tabpanel">
            <h4 className='card-title'>Headers</h4>
            <HttpHeaders headers={request.headers} />
            { this.renderRequestBody() }
          </div>
          {
            //   <div role="tabpanel">
            //       <i>Headers</i>
            //       { response ? (
            //           <HttpHeaders headers={response.headers} />
            //       ) : (<span>Not Available</span>) }
            //   </div>
          }
        </div>
      </div>
    )
  }
}

RequestDetails.propTypes = {
  request: PropTypes.object,
  actions: PropTypes.object,
  itemState: PropTypes.object,
}
