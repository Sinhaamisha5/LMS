import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Book schema stores metadata about library books. Each book document tracks
 * its author, publisher, ISBN, category and counts for available and total
 * copies. Additional fields like description or cover image URL can easily be
 * added as needed.
 */
const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    publisher: { type: String },
    isbn: { type: String, unique: true, required: true },
    publicationYear: { type: Number },
    category: { type: String },
    totalCopies: { type: Number, default: 1 },
    availableCopies: { type: Number, default: 1 },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Book = mongoose.model('Book', bookSchema);
export default Book;