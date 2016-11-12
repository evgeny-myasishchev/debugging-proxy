import _ from 'lodash';
import React, {Component, PropTypes} from 'react'
import HttpBody from './HttpBody.jsx'
import HttpHeaders from './HttpHeaders.jsx'

export default class RequestDetails extends Component {
  componentWillMount() {}

  hasResponse() {
    return _.has(this.props, 'request.response');
  }

  activeTab() {
    if(!this.hasResponse()) return 'request';
    return _.get(this.props, 'itemState.activeTab', 'request');
  }

  renderHttpBody(stateName, fetchAction) {
    const {
      request,
      itemState
    } = this.props;
    if(_.get(itemState, `${stateName}.hasNoBody`, false)) return false;
    const state = _.get(itemState, stateName, {});
    return (
      <div>
        <h4 className='card-title'>Body</h4>
        <div className='card card-outline-secondary'>
          <HttpBody key={stateName} state={state} request={request} actions={{fetchBody: fetchAction}} />
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
      },
      actions : {
        fetchRequestBody, fetchResponseBody
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
              { this.renderHttpBody('req', fetchRequestBody) }
            </div>
          ) : (
            <div id="response" role="tabpanel">
              <h4 className='card-title'>Headers</h4>
              <HttpHeaders headers={response.headers} />
              { this.renderHttpBody('res', fetchResponseBody) }
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
