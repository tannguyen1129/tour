import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 👉 Bước 1: Điều hướng người dùng tới Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 👉 Bước 2: Callback sau khi Google xác thực
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  (req, res) => {
    // 🔐 Tạo JWT token
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🌐 Redirect về frontend kèm token → chuyển sang /login
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  }
);

export default router;
