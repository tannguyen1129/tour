import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Extract and verify token, attach user to context
 */
export const authContext = async ({ req }) => {
  const authHeader = req.headers.authorization;
  
  // Nếu không có header hoặc không đúng format Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    return { user };
  } catch (err) {
    console.warn('⚠️ Token không hợp lệ hoặc hết hạn');
    return { user: null };
  }
};
