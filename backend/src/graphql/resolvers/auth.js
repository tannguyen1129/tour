import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const createToken = (user) => 
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

export default {
  Query: {
    me: (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return User.findById(user.id);
    },
    users: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Forbidden');
      return User.find();
    }
  },
  Mutation: {
    register: async (_, { email, password }) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error('Email already registered');
      const hashed = await bcrypt.hash(password, 10);
      const newUser = await User.create({ email, password: hashed, role: 'customer' });
      const token = createToken(newUser);
      return { token, user: newUser };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid password');
      const token = createToken(user);
      return { token, user };
    },
    updateUser: async (_, { id, email, password }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Forbidden');
      const updates = {};
      if (email) updates.email = email;
      if (password) updates.password = await bcrypt.hash(password, 10);
      return User.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteUser: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Forbidden');
      await User.findByIdAndDelete(id);
      return true;
    }
  }
};
