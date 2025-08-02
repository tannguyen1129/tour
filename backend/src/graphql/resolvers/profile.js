import Profile from '../../models/Profile.js';
import User from '../../models/User.js';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

export default {
  Query: {
    // 🔐 Lấy profile của chính user đăng nhập
    async getMyProfile(_, __, { user }) {
      if (!user) throw new AuthenticationError('Bạn chưa đăng nhập');

      const profile = await Profile.findOne({ user: user.id });
      return profile; // có thể null nếu chưa tạo
    },

    // 🔐 Admin hoặc self get profile by userId
    async getProfileByUser(_, { userId }, { user }) {
      if (!user) throw new AuthenticationError('Bạn chưa đăng nhập');

      const profile = await Profile.findOne({ user: userId }).populate('user');
      if (!profile) throw new UserInputError('Không tìm thấy hồ sơ');

      return profile;
    },
  },

  Mutation: {
    // 🔐 Tạo profile mới cho chính user đang đăng nhập
    async createProfile(_, { userId, input }, { user }) {
      if (!user) throw new AuthenticationError('Bạn chưa đăng nhập');

      // Chỉ cho phép user tạo hồ sơ của chính mình
      if (user.id !== userId) {
        throw new AuthenticationError('Không được phép tạo hồ sơ cho người khác');
      }

      const existing = await Profile.findOne({ user: user.id });
      if (existing) throw new UserInputError('Hồ sơ đã tồn tại');

      const newProfile = new Profile({ user: user.id, ...input });
      await newProfile.save();

      return newProfile;
    },

    // 🔐 Cập nhật hồ sơ của chính mình
    async updateMyProfile(_, { input }, { user }) {
      if (!user) throw new AuthenticationError('Bạn chưa đăng nhập');

      const profile = await Profile.findOne({ user: user.id });
      if (!profile) throw new UserInputError('Chưa có hồ sơ để cập nhật');

      Object.assign(profile, input);
      await profile.save();

      return profile;
    },

    // 🔐 Xóa mềm hồ sơ của chính mình
    async deleteMyProfile(_, __, { user }) {
      if (!user) throw new AuthenticationError('Bạn chưa đăng nhập');

      const profile = await Profile.findOne({ user: user.id });
      if (!profile) throw new UserInputError('Không tìm thấy hồ sơ để xóa');

      profile.isDeleted = true;
      await profile.save();

      return true;
    },
  },

  Profile: {
    // Nạp thông tin user nếu cần populate thủ công
    user: async (parent) => await User.findById(parent.user),
  },
};
