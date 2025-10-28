import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await api.get('/books', {
          params: { search, page },
        });
        setBooks(res.data.books);
        setPages(res.data.pages || 1);
      } catch (err) {
        console.error(err);
      }
    }
    fetchBooks();
  }, [search, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <h2>Books</h2>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title, author, or ISBN"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Title</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Author</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Available</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id}>
              <td style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>{book.title}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>{book.author}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>{book.availableCopies}/{book.totalCopies}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>
                <Link to={`/books/${book._id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem' }}>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem', background: page === p ? '#007bff' : '#f0f0f0', color: page === p ? 'white' : 'black' }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Books;