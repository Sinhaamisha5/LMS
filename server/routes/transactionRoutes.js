import express from 'express';
import { body, param, validationResult } from 'express-validator';
import {
  issueBook,
  returnBook,
  listTransactions,
} from '../controllers/transactionController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/*
 * @route   POST /api/transactions/issue
 * @desc    Issue a book to a user (admin only)
 * @access  Private (admin)
 */
router.post(
  '/issue',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('bookId').isMongoId().withMessage('Book ID is required'),
    body('userId').isMongoId().withMessage('User ID is required'),
    body('days')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Days must be a positive integer'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    issueBook(req, res, next);
  }
);

/*
 * @route   POST /api/transactions/return/:transactionId
 * @desc    Return a book (admin or borrower)
 * @access  Private
 */
router.post(
  '/return/:transactionId',
  authenticateToken,
  [param('transactionId').isMongoId().withMessage('Invalid transaction ID')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    returnBook(req, res, next);
  }
);

/*
 * @route   GET /api/transactions
 * @desc    List transactions (admin sees all, member sees their own)
 * @access  Private
 */
router.get('/', authenticateToken, (req, res, next) => {
  listTransactions(req, res, next);
});

export default router;