import React, { Component, PropTypes } from 'react'

export default class RequestListItem extends Component {
  componentWillMount() {
  }

  render() {
    const req = this.props.request;
    const { selectRequest } = this.props.actions;
    return (
      <tr>
        <td><span className='tag tag-default'>{req.request.method}</span> </td>
        <td>
          <button className="btn btn-link" onClick={() => selectRequest(req)}>
            {req.request.protocol}://{req.request.host}{req.request.path}
          </button>
        </td>
      </tr>
    )
  }
}

RequestListItem.propTypes = {
  request: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
}
