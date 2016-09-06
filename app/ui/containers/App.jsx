import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import React, { Component, PropTypes } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import * as actions from '../actions'
import RequestDetails from '../components/RequestDetails.jsx'
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
    const { entries, selectedRequest } = this.props.requests;
    return (
      <RequestsList selectedRequest={selectedRequest} requests={entries} actions={this.props.actions} />
    )
  }

  render() {
    const { isFetching, selectedRequest } = this.props.requests;
    const renderer = isFetching ? this.renderLoading : this.renderEntries;
    return (
      <div className="container-fluid">
        <h1>Requests</h1>
        
        <div className='row'>
          <div className='col-sm-4'>
            {renderer.apply(this)}
          </div>
          <div className='col-sm-8'>
            <RequestDetails request={selectedRequest} />
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  requests: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    requests: state.requests
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions : bindActionCreators(actions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
