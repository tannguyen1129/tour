// resolvers/favoriteResolvers.js
import Favorite from '../../models/Favorite.js';
import Tour from '../../models/Tour.js';
import User from '../../models/User.js';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

const favoriteResolvers = {
  Query: {
    getFavorites: async (_, { limit = 20, offset = 0 }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Bạn cần đăng nhập để xem danh sách yêu thích');
        }

        const totalCount = await Favorite.countDocuments({
          user: user.id,
          isDeleted: false
        });

        const favorites = await Favorite.find({ 
          user: user.id, 
          isDeleted: false 
        })
        .populate({
          path: 'tour',
          populate: {
            path: 'category'
          }
        })
        .populate('user', 'id email')
        .sort({ order: 1, createdAt: -1 }) // ✅ Sort by order first, then createdAt
        .limit(limit)
        .skip(offset)
        .lean();

        const validFavorites = favorites
          .filter(fav => fav && fav._id && fav.tour && fav.tour._id)
          .map(fav => ({
            id: fav._id.toString(),
            createdAt: fav.createdAt,
            updatedAt: fav.updatedAt,
            order: fav.order || 0, // ✅ Include order
            tour: {
              id: fav.tour._id.toString(),
              title: fav.tour.title || 'Unknown Tour',
              price: fav.tour.price || 0,
              location: fav.tour.location || 'Unknown Location',
              images: fav.tour.images || [],
              category: fav.tour.category ? {
                id: fav.tour.category._id.toString(),
                name: fav.tour.category.name
              } : null
            },
            user: fav.user ? {
              id: fav.user._id.toString(),
              email: fav.user.email
            } : null
          }));

        return {
          success: true,
          message: 'Lấy danh sách yêu thích thành công',
          favorites: validFavorites,
          total: totalCount
        };
      } catch (error) {
        console.error('Error in getFavorites:', error);
        return {
          success: false,
          message: error.message,
          favorites: [],
          total: 0
        };
      }
    },

    isFavorite: async (_, { tourId }, { user }) => {
      try {
        if (!user) return false;

        const favorite = await Favorite.findOne({
          user: user.id,
          tour: tourId,
          isDeleted: false
        });

        return !!favorite;
      } catch (error) {
        console.error('Error in isFavorite:', error);
        return false;
      }
    },

    getTourFavorites: async (_, { tourId }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Bạn cần đăng nhập');
        }

        const tour = await Tour.findOne({ 
          _id: tourId,
          $or: [
            { isDeleted: { $exists: false } },
            { isDeleted: false }
          ]
        });
        
        if (!tour) {
          throw new UserInputError('Tour không tồn tại');
        }

        const favorites = await Favorite.find({ 
          tour: tourId, 
          isDeleted: false 
        })
        .populate('user', 'name email avatar')
        .populate({
          path: 'tour',
          select: 'id title price images'
        })
        .sort({ createdAt: -1 })
        .lean();

        const validFavorites = favorites.filter(fav => fav.tour);

        return {
          success: true,
          message: 'Lấy danh sách người yêu thích tour thành công',
          favorites: validFavorites,
          total: validFavorites.length
        };
      } catch (error) {
        console.error('Error in getTourFavorites:', error);
        return {
          success: false,
          message: error.message,
          favorites: [],
          total: 0
        };
      }
    }
  },

  Mutation: {
    addToFavorites: async (_, { tourId }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Bạn cần đăng nhập để thêm tour yêu thích');
        }

        const tour = await Tour.findById(tourId);
        if (!tour) {
          throw new UserInputError('Tour không tồn tại');
        }

        const existingFavorite = await Favorite.findOne({
          user: user.id,
          tour: tourId
        });

        let favorite;
        if (existingFavorite) {
          if (existingFavorite.isDeleted) {
            existingFavorite.isDeleted = false;
            // ✅ Set order to current max + 1
            const maxOrder = await Favorite.findOne({ user: user.id })
              .sort({ order: -1 }).select('order');
            existingFavorite.order = (maxOrder?.order || 0) + 1;
            favorite = await existingFavorite.save();
          } else {
            throw new UserInputError('Tour đã có trong danh sách yêu thích');
          }
        } else {
          // ✅ Set order for new favorite
          const maxOrder = await Favorite.findOne({ user: user.id })
            .sort({ order: -1 }).select('order');
          
          favorite = new Favorite({
            user: user.id,
            tour: tourId,
            order: (maxOrder?.order || 0) + 1
          });
          await favorite.save();
        }

        await favorite.populate({
          path: 'tour',
          select: 'id title price location images'
        });
        await favorite.populate('user', 'name email');

        return {
          success: true,
          message: 'Đã thêm tour vào danh sách yêu thích',
          favorite
        };
      } catch (error) {
        console.error('Error in addToFavorites:', error);
        return {
          success: false,
          message: error.message,
          favorite: null
        };
      }
    },

    removeFromFavorites: async (_, { tourId }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Bạn cần đăng nhập');
        }

        const favorite = await Favorite.findOne({
          user: user.id,
          tour: tourId,
          isDeleted: false
        });

        if (!favorite) {
          throw new UserInputError('Tour không có trong danh sách yêu thích');
        }

        favorite.isDeleted = true;
        await favorite.save();

        return {
          success: true,
          message: 'Đã xóa tour khỏi danh sách yêu thích',
          favorite: {
            id: favorite.id,
            isDeleted: favorite.isDeleted
          }
        };
      } catch (error) {
        console.error('Error in removeFromFavorites:', error);
        return {
          success: false,
          message: error.message,
          favorite: null
        };
      }
    },

    toggleFavorite: async (_, { tourId }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Bạn cần đăng nhập');
        }

        const tour = await Tour.findById(tourId);
        if (!tour) {
          throw new UserInputError('Tour không tồn tại');
        }

        const existingFavorite = await Favorite.findOne({
          user: user.id,
          tour: tourId
        });

        let favorite;
        let message;

        if (existingFavorite) {
          if (existingFavorite.isDeleted) {
            existingFavorite.isDeleted = false;
            // ✅ Set order when toggling back
            const maxOrder = await Favorite.findOne({ user: user.id })
              .sort({ order: -1 }).select('order');
            existingFavorite.order = (maxOrder?.order || 0) + 1;
            favorite = await existingFavorite.save();
            message = 'Đã thêm tour vào danh sách yêu thích';
          } else {
            existingFavorite.isDeleted = true;
            favorite = await existingFavorite.save();
            message = 'Đã xóa tour khỏi danh sách yêu thích';
          }
        } else {
          // ✅ Set order for new favorite
          const maxOrder = await Favorite.findOne({ user: user.id })
            .sort({ order: -1 }).select('order');
          
          favorite = new Favorite({
            user: user.id,
            tour: tourId,
            order: (maxOrder?.order || 0) + 1
          });
          await favorite.save();
          message = 'Đã thêm tour vào danh sách yêu thích';
        }

        await favorite.populate({
          path: 'tour',
          select: 'id title price'
        });
        await favorite.populate('user', 'name email');

        return {
          success: true,
          message,
          favorite
        };
      } catch (error) {
        console.error('Error in toggleFavorite:', error);
        return {
          success: false,
          message: error.message,
          favorite: null
        };
      }
    },

    // ✅ NEW: Reorder favorites mutation
    reorderFavorites: async (_, { favoriteIds }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Bạn cần đăng nhập để sắp xếp yêu thích');
        }

        if (!favoriteIds || favoriteIds.length === 0) {
          throw new UserInputError('Danh sách favoriteIds không được rỗng');
        }

        // Verify all favoriteIds belong to the user
        const favorites = await Favorite.find({
          _id: { $in: favoriteIds },
          user: user.id,
          isDeleted: false
        });

        if (favorites.length !== favoriteIds.length) {
          throw new UserInputError('Một số favorite không tồn tại hoặc không thuộc về bạn');
        }

        // Update order for each favorite
        const updatePromises = favoriteIds.map((favoriteId, index) => 
          Favorite.findByIdAndUpdate(
            favoriteId,
            { order: index + 1 },
            { new: true }
          )
        );

        const updatedFavorites = await Promise.all(updatePromises);

        // Populate the updated favorites
        const populatedFavorites = await Promise.all(
          updatedFavorites.map(favorite =>
            favorite.populate([
              {
                path: 'tour',
                populate: { path: 'category' }
              },
              {
                path: 'user',
                select: 'id email'
              }
            ])
          )
        );

        return {
          success: true,
          message: 'Đã cập nhật thứ tự danh sách yêu thích',
          favorites: populatedFavorites
        };
      } catch (error) {
        console.error('Error in reorderFavorites:', error);
        return {
          success: false,
          message: error.message,
          favorites: []
        };
      }
    }
  }
};

export default favoriteResolvers;
