import jwt from 'jsonwebtoken';
import User from '../models/user.js';

/**
 * Middleware to authenticate users by verifying a JWT provided in the
 * `token` cookie. If no valid token is provided the request will be rejected
 * with status 401. On success the decoded user object is attached to
 * `req.user`.
 */
export async function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.sendStatus(401);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.sendStatus(401);
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
}

/**
 * Factory function that returns an authorization middleware restricting access
 * to users with the specified roles. Example: `authorizeRoles('admin')`.
 * If the authenticated user's role is not in the allowed list the request
 * responds with status 403.
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
}