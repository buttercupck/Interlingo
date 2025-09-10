import React from 'react';
import RequestQueue from './components/RequestQueue.jsx'
import InterpretersList from './components/interpreters/InterpreterContacts.jsx';

function App(){
  return(
    <div className="App">
      <header>
      <h1> Interlingo App</h1>
      </header>
      <InterpretersList />
      <RequestQueue />
      </div>
  );
}

export default App;