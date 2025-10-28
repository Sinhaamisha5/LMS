import Book from '../models/book.js';
import { validationResult } from 'express-validator';

/**
 * Creates a new book record. Only accessible by admin users. Validates the
 * request body and ensures the ISBN is unique.
 */
export async function addBook(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, author, publisher, isbn, publicationYear, category, totalCopies, description } = req.body;
  try {
    let book = await Book.findOne({ isbn });
    if (book) {
      return res.status(409).json({ message: 'Book with this ISBN already exists' });
    }
    book = new Book({ title, author, publisher, isbn, publicationYear, category, totalCopies, availableCopies: totalCopies, description });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Updates an existing book identified by its ID. Only admin users should call
 * this. The availableCopies field is recalculated if the totalCopies changes.
 */
export async function updateBook(req, res) {
  const { id } = req.params;
  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    Object.assign(book, req.body);
    // If totalCopies was updated, ensure availableCopies does not exceed it.
    if (req.body.totalCopies !== undefined) {
      book.availableCopies = Math.min(book.availableCopies, book.totalCopies);
    }
    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Deletes a book from the collection. Only admin users should call this. If
 * there are outstanding transactions referencing the book, deletion should be
 * disallowed. In this sample we omit transaction checks for brevity.
 */
export async function deleteBook(req, res) {
  const { id } = req.params;
  try {
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book removed', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Retrieves all books, with optional query parameters for searching by title,
 * author, category or ISBN. Supports pagination via `page` and `limit` query
 * parameters.
 */
export async function listBooks(req, res) {
  // Combined search across title, author, category and ISBN
  const { search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    filter.$or = [
      { title: regex },
      { author: regex },
      { category: regex },
      { isbn: regex },
    ];
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  try {
    const books = await Book.find(filter).skip(skip).limit(parseInt(limit));
    const count = await Book.countDocuments(filter);
    const pages = Math.ceil(count / parseInt(limit));
    res.json({ total: count, page: parseInt(page), pages, books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Retrieves a single book by its ID.
 */
export async function getBook(req, res) {
  const { id } = req.params;
  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}