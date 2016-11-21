import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import React, { Component, PropTypes } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../index.css';
import * as actions from '../actions'
import RequestsList from '../components/RequestsList.jsx'

export class App extends Component {
  componentWillMount() {
    const {
      requests : { entries : entries },
      actions : { fetchRequests: fetchRequests}
    } = this.props;

    //Fetching only if there are no entries
    //Helps to prevent fething if we have persisted state (with persistState)
    if(!entries.length) fetchRequests();
  }

  renderLoading() {
    return (
      <div className='tag tag-info'>Loading requests...</div>
    )
  }

  renderEntries() {
    const {
      actions,
      requests : {entries: entries},
      requestListItems
    } = this.props;
    return (
      <RequestsList requests={entries} actions={actions} requestListItems={requestListItems} />
    )
  }

  renderPurgeBtn() {
    const {
      requests : { isPurging },
      actions : { purgeRequests }
    } = this.props;
    const text = isPurging ? 'Purging requests...' : 'Purge requests'
    return (
      <button id='btnPurgeRequests' disabled={isPurging} className='btn btn-primary btn-sm' onClick={() => purgeRequests()}>{text}</button>
    )
  }

  render() {
    const { isFetching } = this.props.requests;
    const renderer = isFetching ? this.renderLoading : this.renderEntries;
    return (
      <div>
        <h1>
          Requests {this.renderPurgeBtn()}
        </h1>
        {renderer.apply(this)}
      </div>
    );
  }
}

App.propTypes = {
  requests: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  requestListItems: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {
    requests: state.requests,
    requestListItems: state.requestListItems,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions : bindActionCreators(actions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
