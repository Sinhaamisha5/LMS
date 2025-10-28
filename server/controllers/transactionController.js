import Transaction from '../models/transaction.js';
import Book from '../models/book.js';
import { validationResult } from 'express-validator';

/**
 * Issues a book to a member. Ensures the book has available copies and creates
 * a transaction record with a due date. The due date is computed by adding
 * `loanPeriodDays` (default: 14 days) to the current date. Decrements
 * availableCopies on the book.
 */
export async function issueBook(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { bookId, userId, days, loanPeriodDays } = req.body;
  const period = loanPeriodDays || days || 14;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No copies available' });
    }
    // Create due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + period);
    // Create transaction
    const txn = new Transaction({ user: userId, book: bookId, dueDate });
    await txn.save();
    // Update availableCopies
    book.availableCopies -= 1;
    await book.save();
    res.status(201).json(txn);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Returns a previously issued book. Updates the transaction status and
 * `returnDate` and increments the book's available copies. Only the user who
 * borrowed the book or an admin should call this endpoint (enforced by
 * authorization middleware outside of this controller).
 */
export async function returnBook(req, res) {
  const { transactionId } = req.params; // transaction ID from URL
  try {
    const txn = await Transaction.findById(transactionId).populate('book');
    if (!txn) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    if (txn.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }
    txn.status = 'returned';
    txn.returnDate = new Date();
    await txn.save();
    // Increment available copies
    const book = txn.book;
    book.availableCopies += 1;
    await book.save();
    res.json({ message: 'Book returned', transaction: txn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Lists all transactions for a given user or all transactions if admin.
 * Supports filtering by status.
 */
export async function listTransactions(req, res) {
  const { userId, status } = req.query;
  const filter = {};
  // If userId provided (admin), filter by userId; else if not admin, restrict to logged-in user
  if (userId) {
    filter.user = userId;
  } else if (req.user && req.user.role !== 'admin') {
    filter.user = req.user._id;
  }
  if (status) filter.status = status;
  try {
    const txns = await Transaction.find(filter)
      .populate('book')
      .populate('user', 'firstName lastName email');
    res.json(txns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}