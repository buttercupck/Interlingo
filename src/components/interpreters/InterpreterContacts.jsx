import React, { useState, useEffect } from 'react';
import { getAllInterpreters } from '../services/interpreterService.js';

function InterpretersList() {
  const [interpreters, setInterpreters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllInterpreters() {
      try {
        setLoading(true);
        const data = await getAllInterpreters();
        setInterpreters(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        setError("Failed to load interpreters.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllInterpreters();
  }, []); // Empty dependency array to run only once on component mount

  if (loading) {
    return <div>Loading interpreters...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>All Interpreters</h1>
      {interpreters.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              {/* Add more headers for all columns you want to display */}
            </tr>
          </thead>
          <tbody>
            {interpreters.map((interpreter) => (
              <tr key={interpreter.id}>
                <td>{interpreter.id}</td>
                <td>{interpreter.first_name}</td>
                <td>{interpreter.last_name}</td>
                <td>{interpreter.email}</td>
                {/* Add more cells for other data */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No interpreters found.</p>
      )}
    </div>
  );
}

export default InterpretersList;