import React, {Component, PropTypes} from 'react'

export default class HttpBody extends Component {
  componentWillMount() {}

  render() {
    const {
      state : {
        isFetchingBody,
        body
      }
    } = this.props;
    return (
      <div>
        { isFetchingBody ? (
          <span>Fetching...</span>
        ) : (
          <span>{body}</span>
        )}
      </div>
    )
  }
}

HttpBody.propTypes = {
  state: PropTypes.object.isRequired
}
