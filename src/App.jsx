import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RequestQueue from './components/RequestQueue.jsx';
import InterpretersList from './components/interpreters/InterpreterContacts.jsx';
import EmailPreviewPage from './pages/EmailPreviewPage.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <h1>Interlingo App</h1>
          <nav style={{ marginTop: '0.5rem' }}>
            <Link to="/" style={{ marginRight: '1rem', color: '#007bff' }}>Home</Link>
            <Link to="/interpreters" style={{ marginRight: '1rem', color: '#007bff' }}>Interpreters</Link>
            <Link to="/email-preview" style={{ marginRight: '1rem', color: '#007bff' }}>📧 Email Preview</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={
            <div>
              <InterpretersList />
              <RequestQueue />
            </div>
          } />
          <Route path="/interpreters" element={<InterpretersList />} />
          <Route path="/email-preview" element={<EmailPreviewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;