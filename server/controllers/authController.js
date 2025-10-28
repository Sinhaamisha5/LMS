import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES_IN || '1h' }
  );
}

/**
 * Registers a new user. Validates the request body using express‑validator and
 * checks if the email already exists. If registration is successful the user is
 * saved and a signed JWT cookie is sent in the response. The password is
 * automatically hashed by the model's pre‑save hook.
 */
export async function register(req, res) {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { firstName, lastName, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    user = new User({ firstName, lastName, email, password });
    await user.save();
    const token = generateToken(user);
    // Send token in HTTP‑only cookie
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Authenticates a user by email and password. If credentials are valid a JWT
 * cookie is issued. The password field must be selected explicitly for the
 * comparison since it is excluded by default.
 */
export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Logs the user out by clearing the JWT cookie.
 */
export function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

/**
 * Returns the currently authenticated user's profile. Requires the user to be authenticated via
 * the authenticateToken middleware. Sensitive fields like password are omitted.
 *
 * @route GET /api/auth/me
 * @access Private
 */
export function getProfile(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const { password, __v, ...userData } = req.user._doc;
  res.json({ user: userData });
}