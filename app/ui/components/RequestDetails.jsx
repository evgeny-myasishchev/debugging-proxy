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

  hasResponse() {
    return _.has(this.props, 'request.response');
  }

  activeTab() {
    if(!this.hasResponse()) return 'request';
    return _.get(this.props, 'itemState.activeTab', 'request');
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

  renderNavTab(href, name, isActive, isDisabled) {
    const classes = ['nav-link'];
    if(isActive) classes.push('active');
    if(isDisabled) classes.push('disabled');
    const {
      request,
      actions : { activateRequestDetailsTab }
    } = this.props;

    function handleClick(e) {
      activateRequestDetailsTab(request, href);
      e.preventDefault();
    }

    return (
      <li className="nav-item">
        <a
          className={classes.join(' ')}
          onClick={handleClick}
          data-toggle="tab"
          href={'#' + href}
          role="tab"
        >{name}</a>
      </li>
    )
  }


  render() {
    const {
      request: {
        request,
        response
      }
    } = this.props;
    const activeTab = this.activeTab();

    return (
      <div className='card'>
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs float-xs-left" role="tablist">
            {this.renderNavTab('request', 'Request', activeTab === 'request')}
            {this.renderNavTab('response', 'Response', activeTab === 'response', !this.hasResponse())}
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
