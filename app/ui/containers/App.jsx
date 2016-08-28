import { connect } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import React, { Component, PropTypes } from 'react'
import { fetchRequests } from '../actions'
import RequestsList from '../components/RequestsList.jsx'

class App extends Component {
  componentWillMount() {
    this.props.fetchRequests();
  }
  
  renderLoading() {
    return (
      <div className='tag tag-info'>loading requests...</div>
    )
  }
  
  renderEntries() {
    const requests = this.props.requests;
    return (
      <RequestsList requests={requests} />
    )
  }

  render() {
    const renderer = this.props.isFetching ? this.renderLoading : this.renderEntries;
    return (
      <div>
        <h1>Requests</h1>
        {renderer.apply(this)}
      </div>
    );
  }
}

App.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  requests: PropTypes.array.isRequired,
  fetchRequests: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    isFetching: state.requests.isFetching,
    requests: state.requests.entries
  }
}

export default connect(mapStateToProps, {
  fetchRequests,
})(App)
