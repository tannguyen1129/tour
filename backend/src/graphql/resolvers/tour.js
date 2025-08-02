import Tour from '../../models/Tour.js';

export default {
  Query: {
    tours: async () => {
      // ✅ Trả về trực tiếp như Voucher - không format dates
      return await Tour.find({ isDeleted: false })
        .populate('category')
        .sort({ createdAt: -1 }); // ✅ Thêm sort như Voucher để consistent ordering
    },
    
    tour: async (_, { id }) => {
      const tour = await Tour.findById(id).populate('category');
      if (!tour || tour.isDeleted) {
        throw new Error('Tour not found');
      }
      // ✅ Trả về trực tiếp - không format dates
      return tour;
    }
  },

  Mutation: {
    createTour: async (_, { input }) => {
      try {
        const tour = await Tour.create(input);
        // ✅ Trả về trực tiếp với populate - không format dates
        return await Tour.findById(tour._id).populate('category');
      } catch (error) {
        throw new Error(`Failed to create tour: ${error.message}`);
      }
    },

    updateTour: async (_, { id, input }) => {
      try {
        const existingTour = await Tour.findById(id);
        if (!existingTour || existingTour.isDeleted) {
          throw new Error('Tour not found');
        }

        // ✅ Trả về trực tiếp với populate - không format dates
        const tour = await Tour.findByIdAndUpdate(
          id, 
          input, 
          { new: true }
        ).populate('category');
        
        return tour;
      } catch (error) {
        throw new Error(`Failed to update tour: ${error.message}`);
      }
    },

    deleteTour: async (_, { id }) => {
      try {
        const tour = await Tour.findById(id);
        if (!tour || tour.isDeleted) {
          throw new Error('Tour not found');
        }
        
        // ✅ Soft delete như existing logic
        tour.isDeleted = true;
        await tour.save();
        return true;
      } catch (error) {
        throw new Error(`Failed to delete tour: ${error.message}`);
      }
    }
  }
};
