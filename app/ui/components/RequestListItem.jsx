import React, { Component, PropTypes } from 'react'

export default class RequestListItem extends Component {
  componentWillMount() {
  }

  render() {
    const { request, isSelected } = this.props;
    const { selectRequest } = this.props.actions;
    const href = `${request.request.protocol}://${request.request.host}${request.request.path}`
    return (
      <tr className={isSelected ? 'table-active' : null}>
        <td><span className='tag tag-default'>{request.request.method}</span> </td>
        <td>
          <button title={href} className="btn btn-sm btn-link" onClick={() => selectRequest(request)}>
            {href}
          </button>
        </td>
      </tr>
    )
  }
}

RequestListItem.propTypes = {
  request: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired
}
