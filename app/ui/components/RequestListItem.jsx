import React, { Component, PropTypes } from 'react'
import RequestDetails from './RequestDetails.jsx'

const responseStatusTags = [
  null, 'tag-info', 'tag-success', 'tag-default', 'tag-warning', 'tag-danger'
]

export default class RequestListItem extends Component {
  componentWillMount() {
  }

  renderRequestDetails() {
    return (
      <RequestDetails {...this.props} />
    )
  }

  renderResponseStatus(response) {
    if(!response) return null;
    const statusCodeClass = responseStatusTags[Math.floor(response.statusCode / 100)];
    return (
      <div id='response-status-code' className={`tag ${statusCodeClass}`}>{response.statusCode} {response.statusMessage}</div>
    )
  }

  render() {
    const { request, itemState : { expanded : expanded } } = this.props;
    const response = request.response;
    const { toggleRequestListItem } = this.props.actions;
    const href = `${request.request.protocol}://${request.request.host}${request.request.path}`
    const {
      rowClass,
      caret
    } = expanded ?
      { rowClass : 'list-group-item list-group-item-info', caret: 'fa-lg fa fa-caret-down' } :
      { rowClass : 'list-group-item', caret: 'fa-lg fa fa-caret-right' };
    return (
      <div className={rowClass}>
        <button title={href} className="btn btn-sm btn-link" onClick={() => toggleRequestListItem(request)}>
          <i className={caret} aria-hidden="true" /> <span className='tag tag-default'>{request.request.method}</span> {href}
        </button>
        {this.renderResponseStatus(response)}
        {expanded ? this.renderRequestDetails() : ''}
      </div>
    )
  }
}

RequestListItem.propTypes = {
  request: PropTypes.object.isRequired,
  itemState: PropTypes.object,
  actions: PropTypes.object.isRequired
}
