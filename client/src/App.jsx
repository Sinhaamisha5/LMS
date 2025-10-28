import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // On mount, check if user is already logged in by hitting /api/auth/me (not yet implemented)
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        // Not authenticated
        setUser(null);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <NavBar user={user} onLogout={handleLogout} />
      <div className="container" style={{ padding: '1rem' }}>
        <Routes>
          <Route
            path="/"
            element={user ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/books"
            element={user ? <Books /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/books/:id"
            element={user ? <BookDetails /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;