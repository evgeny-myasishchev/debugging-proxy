import React, { Component, PropTypes } from 'react'

export default class RequestListItem extends Component {
  componentWillMount() {
  }

  render() {
    const { request } = this.props;
    const { toggleRequestListItem } = this.props.actions;
    const href = `${request.request.protocol}://${request.request.host}${request.request.path}`
    return (
      <tr>
        <td><span className='tag tag-default'>{request.request.method}</span></td>
        <td>
          <button title={href} className="btn btn-sm btn-link" onClick={() => toggleRequestListItem(request)}>
            {href}
          </button>
        </td>
      </tr>
    )
  }
}

RequestListItem.propTypes = {
  request: PropTypes.object.isRequired,
  itemState: PropTypes.object,
  actions: PropTypes.object.isRequired
}
