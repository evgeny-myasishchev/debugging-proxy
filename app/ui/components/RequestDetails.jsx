import _ from 'lodash';
import React, {Component, PropTypes} from 'react'
import HttpBody from './HttpBody.jsx'
import HttpHeaders from './HttpHeaders.jsx'

export default class RequestDetails extends Component {
  componentWillMount() {
    const {
      itemState,
      request,
      actions : { fetchRequestBody, fetchResponseBody }
    } = this.props;

    const activeTab = _.get(itemState, 'activeTab', 'request');

    if(activeTab === 'request') {
      if(!_.get(itemState, 'req.hasNoBody', false) && !_.get(itemState, 'req.bodyFetched', false)) {
        fetchRequestBody(request);
      }
    } else {
      if(!_.get(itemState, 'res.bodyFetched', false)) {
        fetchResponseBody(request);
      }
    }
  }

  renderHttpBody(stateName) {
    const {
      itemState
    } = this.props;
    if(!_.has(itemState, stateName)) return false;
    if(_.get(itemState, `${stateName}.hasNoBody`, true)) return false;
    const state = itemState[stateName];
    return (
      <div>
        <h4 className='card-title'>Body</h4>
        <div className='card card-outline-secondary'>
          <HttpBody state={state} />
        </div>
      </div>
    )
  }

  renderNavTab(href, name, isActive) {
    return (
      <li className="nav-item">
        <a className={isActive ? 'nav-link active' : 'nav-link'} data-toggle="tab" href={'#' + href} role="tab">{name}</a>
      </li>
    )
  }

  render() {
    const {
      itemState: {
        activeTab: activeTab = 'request'
      },
      request: {
        request,
        response
      }
    } = this.props;
    return (
      <div className='card'>
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs float-xs-left" role="tablist">
            {this.renderNavTab('request', 'Request', activeTab === 'request')}
            {this.renderNavTab('response', 'Response', activeTab === 'response')}
          </ul>
        </div>
        <div className="card-block">
          { activeTab === 'request' ? (
            <div id="request" role="tabpanel">
              <h4 className='card-title'>Headers</h4>
              <HttpHeaders headers={request.headers} />
              { this.renderHttpBody('req') }
            </div>
          ) : (
            <div id="response" role="tabpanel">
              <h4 className='card-title'>Headers</h4>
              <HttpHeaders headers={response.headers} />
              { this.renderHttpBody('res') }
            </div>
          )}
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
