import Review from '../../models/Review.js';

export default {
  Query: {
    reviews: async (_, { tour }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const filter = { isDeleted: false };
      if (tour) filter.tour = tour;

      const reviews = await Review.find(filter)
        .populate('tour', 'title')
        .populate('user', 'email');

      return reviews;
    },

    review: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const review = await Review.findById(id)
        .where({ isDeleted: false })
        .populate('tour', 'title')
        .populate('user', 'email');

      if (!review) throw new Error('Not found');

      return review;
    }
  },

  Mutation: {
    createReview: async (_, { tour, rating, comment, images }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const newReview = await Review.create({
        tour,
        user: user.id,
        rating,
        comment,
        images: images || [],
        status: 'visible'
      });

      return Review.findById(newReview._id)
        .populate('tour', 'title')
        .populate('user', 'email');
    },

    updateReview: async (_, { id, rating, comment, status, images }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const review = await Review.findById(id);
      if (!review || review.isDeleted) throw new Error('Not found');
      if (String(review.user) !== user.id && user.role !== 'admin') throw new Error('Forbidden');

      const updateData = {};
      if (rating !== undefined) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment;
      if (status !== undefined) updateData.status = status;
      if (images !== undefined) updateData.images = images;

      await Review.findByIdAndUpdate(id, updateData);

      return Review.findById(id)
        .populate('tour', 'title')
        .populate('user', 'email');
    },

    deleteReview: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const review = await Review.findById(id);
      if (!review || review.isDeleted) throw new Error('Not found');
      if (String(review.user) !== user.id && user.role !== 'admin') throw new Error('Forbidden');

      await Review.findByIdAndUpdate(id, { isDeleted: true });
      return true;
    },

    replyReview: async (_, { id, reply }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Forbidden');

      const review = await Review.findById(id);
      if (!review || review.isDeleted) throw new Error('Not found');

      review.reply = reply;
      await review.save();

      return Review.findById(id)
        .populate('tour', 'title')
        .populate('user', 'email');
    }
  },

  // ✅ Map _id -> id
  Review: {
    id: (parent) => parent._id.toString(),
  }
};
