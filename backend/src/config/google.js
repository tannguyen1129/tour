import dotenv from 'dotenv';
dotenv.config(); // 🛠️ Load biến môi trường sớm nhất

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });

    if (!user) {
      // ✅ Tạo user mới với password giả nếu cần thiết
      const fakePassword = Math.random().toString(36).slice(-8); // random chuỗi 8 ký tự

      user = await User.create({
        email,
        password: fakePassword,
        role: 'customer',
        status: 'active'
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
