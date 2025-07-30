import Tour from '../../models/Tour.js';

export default {
  Query: {
    tours: async () => {
      return await Tour.find({ isDeleted: false }).populate('category');
    },
    tour: async (_, { id }) => {
      return await Tour.findById(id).populate('category');
    }
  },
  Mutation: {
    createTour: async (_, { input }) => {
      const tour = await Tour.create(input);
      return await Tour.findById(tour._id).populate('category'); // Trả về tour đã populate
    },
    updateTour: async (_, { id, input }) => {
      const tour = await Tour.findByIdAndUpdate(id, input, { new: true }).populate('category');
      return tour;
    },
    deleteTour: async (_, { id }) => {
      const tour = await Tour.findById(id);
      if (!tour) throw new Error('Tour not found');
      tour.isDeleted = true;
      await tour.save();
      return true;
    }
  }
};
