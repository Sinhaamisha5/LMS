import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

/**
 * User schema defines library members and admins. Each user has a unique email
 * address used for login, a hashed password, a role (e.g. `member` or `admin`),
 * and other profile information. The schema includes pre‑save middleware to
 * automatically hash passwords when they are created or updated.
 */
const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
    membershipDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash the password before saving the document. If the password field has not
// been modified then skip hashing so updates don’t cause unnecessary rehashing.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compares a plain password against the hashed password stored on the user.
 * This helper is used in the authentication flow to verify credentials.
 * @param {string} candidatePassword The plaintext password to verify.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;