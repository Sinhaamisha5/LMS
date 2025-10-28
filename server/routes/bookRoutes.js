import express from 'express';
import { body, param, validationResult } from 'express-validator';
import {
  addBook,
  updateBook,
  deleteBook,
  listBooks,
  getBook,
} from '../controllers/bookController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/*
 * @route   POST /api/books
 * @desc    Add a new book (admin only)
 * @access  Private (admin)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('isbn').notEmpty().withMessage('ISBN is required'),
    body('totalCopies').isInt({ min: 1 }).withMessage('Total copies must be at least 1'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    addBook(req, res, next);
  }
);

/*
 * @route   GET /api/books
 * @desc    Get list of books with optional search and pagination
 * @access  Public
 */
router.get('/', listBooks);

/*
 * @route   GET /api/books/:id
 * @desc    Get a single book by ID
 * @access  Public
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid book ID')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    getBook(req, res, next);
  }
);

/*
 * @route   PUT /api/books/:id
 * @desc    Update an existing book (admin only)
 * @access  Private (admin)
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('id').isMongoId().withMessage('Invalid book ID'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().notEmpty().withMessage('Author cannot be empty'),
    body('totalCopies')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Total copies must be at least 1'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    updateBook(req, res, next);
  }
);

/*
 * @route   DELETE /api/books/:id
 * @desc    Delete a book (admin only)
 * @access  Private (admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  [param('id').isMongoId().withMessage('Invalid book ID')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    deleteBook(req, res, next);
  }
);

export default router;