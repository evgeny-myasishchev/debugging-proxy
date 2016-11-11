import React, {Component, PropTypes} from 'react'

export default class HttpBody extends Component {
  componentWillMount() {
    const {
      request,
      state : { isFetchingBody, hasNoBody, bodyFetched
    }, actions : { fetchBody } } = this.props;

    if(isFetchingBody) return;
    if(hasNoBody) return;
    if(bodyFetched) return;
    fetchBody(request);
  }

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
          <span id='body-fetching-progress'>Fetching...</span>
        ) : (
          <span id='body-contents'>{body}</span>
        )}
      </div>
    )
  }
}

HttpBody.propTypes = {
  request : PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}
