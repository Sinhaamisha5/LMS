import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Transaction schema tracks when a member borrows or returns a book. Each
 * transaction references a user and a book and stores dates for issuing,
 * returning and due date. The `status` field helps differentiate between
 * ongoing and completed loans.
 */
const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: {
      type: String,
      enum: ['issued', 'returned'],
      default: 'issued',
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;