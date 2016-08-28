import { connect } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import React, { Component, PropTypes } from 'react'
import { fetchRequests } from '../actions'

class App extends Component {
  componentWillMount() {
    this.props.fetchRequests();
  }

  render() {
    return (
      <div>
        <h1>It Works!</h1>
        <p>This React project just works including local styles.</p>
        <p>Global bootstrap css import works too as you can see on the following button.</p>
        <p><a href="" className="btn btn-primary btn-lg">Say Hello!</a></p>
      </div>
    );
  }
}

App.propTypes = {
  fetchRequests: PropTypes.func.isRequired
}

export default connect(null, {
  fetchRequests,
})(App)
