import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { render } from 'react-dom';
import React from 'react';
import Hello from './hello.jsx';

function App() {
  return (
    <div>
      <h1>It Works!</h1>
      <p>This React project just works including local styles.</p>
      <p>Global bootstrap css import works too as you can see on the following button.</p>
      <p><a className="btn btn-primary btn-lg">Enjoy!</a></p>
      <Hello />
    </div>
  );
}

render(<App />, document.querySelector('#app'));
