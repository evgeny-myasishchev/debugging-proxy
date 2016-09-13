import React, { Component, PropTypes } from 'react'
import RequestDetails from './RequestDetails.jsx'

export default class RequestListItem extends Component {
  componentWillMount() {
  }
  
  renderRequestDetails() {
    return (
      <RequestDetails {...this.props} />
    )
  }

  render() {
    const { request, itemState : { expanded : expanded } } = this.props;
    const { toggleRequestListItem } = this.props.actions;
    const href = `${request.request.protocol}://${request.request.host}${request.request.path}`
    const {
      rowClass,
      caret
    } = expanded ? 
      { rowClass : 'list-group-item list-group-item-info', caret: 'fa-lg fa fa-caret-down' } : 
      { rowClass : 'list-group-item ', caret: 'fa-lg fa fa-caret-right' };
    return (
      <div className={rowClass}>
        <button title={href} className="btn btn-sm btn-link" onClick={() => toggleRequestListItem(request)}>
          <i className={caret} aria-hidden="true" />
          <span className='tag tag-default'>{request.request.method}</span>
          {href}
        </button>
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
