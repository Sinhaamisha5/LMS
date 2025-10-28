import React from 'react';
import { Link } from 'react-router-dom';

function NavBar({ user, onLogout }) {
  return (
    <nav style={{ background: '#343a40', padding: '0.5rem 1rem', color: 'white' }}>
      <Link to="/" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>
        Library
      </Link>
      {user && (
        <>
          <Link
            to="/books"
            style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}
          >
            Books
          </Link>
        </>
      )}
      <span style={{ float: 'right' }}>
        {user ? (
          <>
            <span style={{ marginRight: '1rem' }}>Hello, {user.firstName}</span>
            <button onClick={onLogout} style={{ padding: '0.3rem 0.6rem' }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
            Login
          </Link>
        )}
      </span>
    </nav>
  );
}

export default NavBar;