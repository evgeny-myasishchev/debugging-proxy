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

    if(!_.get(itemState, 'req.hasNoBody', false) || !_.get(itemState, 'req.bodyFetched', false)) {
      fetchRequestBody(request);
    }
  }

  render() {
    const {
      itemState,
      request: {
        request,
        // response
      }
    } = this.props;
    const reqState = itemState.req;
    return (
      <div className='card'>
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs float-xs-left" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" data-toggle="tab" href="#home" role="tab">Request</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#profile" role="tab">Respnse</a>
            </li>
          </ul>
        </div>
        <div className="card-block">
          <div id="home" role="tabpanel">
            <h4 className='card-title'>Headers</h4>
            <HttpHeaders headers={request.headers} />
            <h4 className='card-title'>Body</h4>
            <div className='card card-outline-secondary'>
              <HttpBody state={reqState} />
            </div>
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
