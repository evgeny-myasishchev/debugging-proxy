import React, {Component, PropTypes} from 'react'

export default class HttpBody extends Component {
  componentWillMount() {}

  render() {
    const {
      state : {
        body
      }
    } = this.props;
    return (
      <div>{body}</div>
    )
  }
}

HttpBody.propTypes = {
  state: PropTypes.object.isRequired
}
