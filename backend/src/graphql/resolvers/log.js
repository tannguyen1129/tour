import Log from '../../models/Log.js';

export default {
  Query: {
    logs: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Forbidden');
      return Log.find();
    }
  }
};
