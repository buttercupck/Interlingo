import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import JobPage from './pages/JobPage';
import Interpreters from './pages/Interpreters';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Main routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs/:jobId" element={<JobPage />} />
          <Route path="/interpreters" element={<Interpreters />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;