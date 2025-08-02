import Booking from '../../models/Booking.js';
import Tour from '../../models/Tour.js';
import User from '../../models/User.js';
import Category from '../../models/Category.js';
import Payment from '../../models/Payment.js';
import Profile from '../../models/Profile.js';
import Review from '../../models/Review.js';
import Voucher from '../../models/Voucher.js';

const statisticsResolvers = {
  Query: {
    // ===== TỔNG QUAN DASHBOARD =====
    dashboardOverview: async () => {
      try {
        const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
        const totalTours = await Tour.countDocuments({ isDeleted: { $ne: true } });
        const totalBookings = await Booking.countDocuments({ isDeleted: { $ne: true } });
        
        const revenueResult = await Booking.aggregate([
          { $match: { isDeleted: { $ne: true }, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        const activeUsers = await User.countDocuments({ 
          status: 'active', 
          isDeleted: { $ne: true },
          lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days
        });

        const completedBookings = await Booking.countDocuments({ 
          status: 'confirmed', 
          isDeleted: { $ne: true } 
        });

        const pendingBookings = await Booking.countDocuments({ 
          status: 'pending', 
          isDeleted: { $ne: true } 
        });

        const cancelledBookings = await Booking.countDocuments({ 
          status: 'cancelled', 
          isDeleted: { $ne: true } 
        });

        const avgRatingResult = await Review.aggregate([
          { $match: { isDeleted: { $ne: true } } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        const averageRating = avgRatingResult[0]?.avgRating || 0;

        // Tính growth rate (so với tháng trước)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const lastMonthBookings = await Booking.countDocuments({
          createdAt: { $gte: lastMonth },
          isDeleted: { $ne: true }
        });
        
        const growthRate = lastMonthBookings > 0 ? 
          ((totalBookings - lastMonthBookings) / lastMonthBookings * 100) : 0;

        return {
          totalUsers,
          totalTours,
          totalBookings,
          totalRevenue,
          activeUsers,
          completedBookings,
          pendingBookings,
          cancelledBookings,
          averageRating: parseFloat(averageRating.toFixed(2)),
          growthRate: parseFloat(growthRate.toFixed(2)),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } catch (error) {
        throw new Error(`Error fetching dashboard overview: ${error.message}`);
      }
    },

    // ===== BIỂU ĐỒ CỘT - THỐNG KÊ THEO THÁNG =====
    monthlyStatsForYear: async (_, { year }) => {
      try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);

        const monthlyData = await Booking.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lt: endDate },
              isDeleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' }
              },
              totalBookings: { $sum: 1 },
              totalRevenue: { $sum: '$total' },
              confirmedBookings: {
                $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
              },
              pendingBookings: {
                $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
              },
              cancelledBookings: {
                $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
              },
              confirmedRevenue: {
                $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] }
              },
              pendingRevenue: {
                $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, '$total', 0] }
              }
            }
          },
          { $sort: { '_id.month': 1 } }
        ]);

        // Lấy thống kê user mới theo tháng
        const newUsersData = await User.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lt: endDate },
              isDeleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' }
              },
              newUsers: { $sum: 1 }
            }
          }
        ]);

        // Tạo array đầy đủ 12 tháng
        const result = [];
        for (let month = 1; month <= 12; month++) {
          const monthData = monthlyData.find(d => d._id.month === month) || {};
          const userData = newUsersData.find(d => d._id.month === month) || {};
          
          const totalBookings = monthData.totalBookings || 0;
          const totalRevenue = monthData.totalRevenue || 0;
          const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

          result.push({
            month,
            year,
            totalBookings,
            totalRevenue,
            confirmedBookings: monthData.confirmedBookings || 0,
            pendingBookings: monthData.pendingBookings || 0,
            cancelledBookings: monthData.cancelledBookings || 0,
            confirmedRevenue: monthData.confirmedRevenue || 0,
            pendingRevenue: monthData.pendingRevenue || 0,
            averageBookingValue: parseFloat(avgBookingValue.toFixed(2)),
            newUsers: userData.newUsers || 0,
            returningUsers: 0, // Có thể tính sau nếu cần
            topTour: null, // Sẽ populate sau nếu cần
            popularCategory: null // Sẽ populate sau nếu cần
          });
        }

        return result;
      } catch (error) {
        throw new Error(`Error fetching monthly stats: ${error.message}`);
      }
    },

    // ===== SO SÁNH THEO KHOẢNG THỜI GIAN =====
    periodComparison: async (_, { currentRange, previousRange }) => {
      try {
        const getCurrentPeriodData = async (startDate, endDate) => {
          const bookings = await Booking.countDocuments({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            isDeleted: { $ne: true }
          });

          const revenueResult = await Booking.aggregate([
            {
              $match: {
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                paymentStatus: 'paid',
                isDeleted: { $ne: true }
              }
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
          ]);

          const revenue = revenueResult[0]?.total || 0;
          const users = await User.countDocuments({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            isDeleted: { $ne: true }
          });

          const averageOrderValue = bookings > 0 ? revenue / bookings : 0;

          return {
            startDate,
            endDate,
            totalBookings: bookings,
            totalRevenue: revenue,
            totalUsers: users,
            totalPassengers: 0, // Sẽ tính sau
            averageOrderValue,
            topTour: null,
            topCategory: null
          };
        };

        const currentPeriod = await getCurrentPeriodData(
          currentRange.startDate,
          currentRange.endDate
        );

        const previousPeriod = await getCurrentPeriodData(
          previousRange.startDate,
          previousRange.endDate
        );

        const bookingGrowthRate = previousPeriod.totalBookings > 0 ?
          ((currentPeriod.totalBookings - previousPeriod.totalBookings) / previousPeriod.totalBookings * 100) : 0;

        const revenueGrowthRate = previousPeriod.totalRevenue > 0 ?
          ((currentPeriod.totalRevenue - previousPeriod.totalRevenue) / previousPeriod.totalRevenue * 100) : 0;

        const userGrowthRate = previousPeriod.totalUsers > 0 ?
          ((currentPeriod.totalUsers - previousPeriod.totalUsers) / previousPeriod.totalUsers * 100) : 0;

        const growthRate = (bookingGrowthRate + revenueGrowthRate) / 2;
        
        let trend = 'STABLE';
        if (growthRate > 5) trend = 'UP';
        else if (growthRate < -5) trend = 'DOWN';

        return {
          currentPeriod,
          previousPeriod,
          growthRate: parseFloat(growthRate.toFixed(2)),
          revenueGrowthRate: parseFloat(revenueGrowthRate.toFixed(2)),
          bookingGrowthRate: parseFloat(bookingGrowthRate.toFixed(2)),
          userGrowthRate: parseFloat(userGrowthRate.toFixed(2)),
          trend
        };
      } catch (error) {
        throw new Error(`Error fetching period comparison: ${error.message}`);
      }
    },

    // ===== THỐNG KÊ CHI TIẾT THEO NGÀY =====
    dailyDetailedStats: async (_, { startDate, endDate, filters }) => {
      try {
        const matchConditions = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          isDeleted: { $ne: true }
        };

        // Apply filters
        if (filters?.status) matchConditions.status = filters.status;
        if (filters?.tourId) matchConditions.tour = filters.tourId;
        if (filters?.userId) matchConditions.user = filters.userId;

        const dailyStats = await Booking.aggregate([
          { $match: matchConditions },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              bookings: { $push: '$$ROOT' },
              totalBookings: { $sum: 1 },
              totalRevenue: { $sum: '$total' },
              totalPassengers: { $sum: { $size: '$passengers' } }
            }
          },
          { $sort: { '_id': 1 } }
        ]);

        const result = [];
        for (const dayData of dailyStats) {
          const avgBookingValue = dayData.totalBookings > 0 ? 
            dayData.totalRevenue / dayData.totalBookings : 0;

          // Get detailed bookings with populated data
          const detailedBookings = await Booking.find({
            _id: { $in: dayData.bookings.map(b => b._id) }
          })
          .populate('tour', 'title price category')
          .populate('user', 'email')
          .populate('tour.category', 'name')
          .lean();

          const bookingDetails = detailedBookings.map(booking => ({
            id: booking._id,
            bookingDate: booking.createdAt.toISOString().split('T')[0],
            tour: {
              id: booking.tour._id,
              title: booking.tour.title,
              price: booking.tour.price,
              location: booking.location || '',
              category: booking.tour.category ? {
                id: booking.tour.category._id,
                name: booking.tour.category.name
              } : null
            },
            user: {
              id: booking.user._id,
              email: booking.user.email,
              phone: booking.user.phone || '',
              profile: null // Có thể populate sau
            },
            passengers: booking.passengers || [],
            totalAmount: booking.total,
            basePrice: booking.basePrice,
            discount: booking.discount || 0,
            paymentMethod: booking.paymentMethod,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            voucher: booking.appliedVoucher ? {
              id: booking.voucher,
              code: booking.appliedVoucher.code,
              type: booking.appliedVoucher.discountType,
              discountValue: booking.appliedVoucher.discountValue,
              appliedDiscount: booking.appliedVoucher.appliedDiscount
            } : null,
            createdAt: booking.createdAt
          }));

          result.push({
            date: dayData._id,
            bookings: bookingDetails,
            totalBookings: dayData.totalBookings,
            totalRevenue: dayData.totalRevenue,
            totalPassengers: dayData.totalPassengers,
            averageBookingValue: parseFloat(avgBookingValue.toFixed(2)),
            topTour: null, // Có thể tính top tour trong ngày
            paymentMethodBreakdown: [] // Có thể tính breakdown thanh toán
          });
        }

        return result;
      } catch (error) {
        throw new Error(`Error fetching daily detailed stats: ${error.message}`);
      }
    },

    // ===== CHI TIẾT BOOKING TRONG KHOẢNG THỜI GIAN =====
    bookingDetailsInRange: async (_, { startDate, endDate, filters, limit, offset, sortBy, sortOrder }) => {
      try {
        const matchConditions = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          isDeleted: { $ne: true }
        };

        // Apply filters
        if (filters?.status) matchConditions.status = filters.status;
        if (filters?.tourId) matchConditions.tour = filters.tourId;
        if (filters?.userId) matchConditions.user = filters.userId;

        const sortOptions = {};
        sortOptions[sortBy || 'createdAt'] = sortOrder === 'ASC' ? 1 : -1;

        const bookings = await Booking.find(matchConditions)
          .populate('tour', 'title price location category')
          .populate('user', 'email phone')
          .populate('tour.category', 'name')
          .sort(sortOptions)
          .limit(limit)
          .skip(offset)
          .lean();

        return bookings.map(booking => ({
          id: booking._id,
          bookingDate: booking.createdAt.toISOString().split('T')[0],
          tour: {
            id: booking.tour._id,
            title: booking.tour.title,
            price: booking.tour.price,
            location: booking.tour.location || '',
            category: booking.tour.category ? {
              id: booking.tour.category._id,
              name: booking.tour.category.name
            } : null
          },
          user: {
            id: booking.user._id,
            email: booking.user.email,
            phone: booking.user.phone || '',
            profile: null
          },
          passengers: booking.passengers || [],
          totalAmount: booking.total,
          basePrice: booking.basePrice,
          discount: booking.discount || 0,
          paymentMethod: booking.paymentMethod,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          voucher: booking.appliedVoucher ? {
            id: booking.voucher,
            code: booking.appliedVoucher.code,
            type: booking.appliedVoucher.discountType,
            discountValue: booking.appliedVoucher.discountValue,
            appliedDiscount: booking.appliedVoucher.appliedDiscount
          } : null,
          createdAt: booking.createdAt
        }));
      } catch (error) {
        throw new Error(`Error fetching booking details in range: ${error.message}`);
      }
    },

    // ===== TOP TOURS =====
    topTours: async (_, { startDate, endDate, sortBy, limit }) => {
      try {
        let sortField;
        switch (sortBy) {
          case 'revenue':
            sortField = 'totalRevenue';
            break;
          case 'bookings':
            sortField = 'bookingCount';
            break;
          case 'passengers':
            sortField = 'totalPassengers';
            break;
          default:
            sortField = 'totalRevenue';
        }

        const topTours = await Booking.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              },
              isDeleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: '$tour',
              bookingCount: { $sum: 1 },
              totalRevenue: { $sum: '$total' },
              totalPassengers: { $sum: { $size: '$passengers' } }
            }
          },
          { $sort: { [sortField]: -1 } },
          { $limit: limit },
          {
            $lookup: {
              from: 'tours',
              localField: '_id',
              foreignField: '_id',
              as: 'tourInfo'
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'tourInfo.category',
              foreignField: '_id',
              as: 'categoryInfo'
            }
          }
        ]);

        // Get average rating for each tour
        const result = [];
        for (const tour of topTours) {
          const avgRatingResult = await Review.aggregate([
            { $match: { tour: tour._id, isDeleted: { $ne: true } } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
          ]);

          const averageRating = avgRatingResult[0]?.avgRating || 0;
          const averageBookingValue = tour.bookingCount > 0 ? 
            tour.totalRevenue / tour.bookingCount : 0;

          result.push({
            id: tour._id,
            title: tour.tourInfo[0]?.title || '',
            price: tour.tourInfo[0]?.price || 0,
            location: tour.tourInfo[0]?.location || '',
            categoryName: tour.categoryInfo[0]?.name || '',
            bookingCount: tour.bookingCount,
            totalRevenue: tour.totalRevenue,
            totalPassengers: tour.totalPassengers,
            averageRating: parseFloat(averageRating.toFixed(2)),
            averageBookingValue: parseFloat(averageBookingValue.toFixed(2))
          });
        }

        return result;
      } catch (error) {
        throw new Error(`Error fetching top tours: ${error.message}`);
      }
    },

    // ===== PHÂN TÍCH THANH TOÁN =====
    paymentMethodAnalytics: async (_, { startDate, endDate }) => {
      try {
        const paymentStats = await Booking.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              },
              paymentMethod: { $exists: true, $ne: null },
              isDeleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: '$paymentMethod',
              count: { $sum: 1 },
              totalAmount: { $sum: '$total' },
              successCount: {
                $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
              }
            }
          }
        ]);

        const totalBookings = paymentStats.reduce((sum, stat) => sum + stat.count, 0);
        const totalAmount = paymentStats.reduce((sum, stat) => sum + stat.totalAmount, 0);

        return paymentStats.map(stat => ({
          method: stat._id,
          count: stat.count,
          totalAmount: stat.totalAmount,
          percentage: totalBookings > 0 ? 
            parseFloat((stat.count / totalBookings * 100).toFixed(2)) : 0,
          averageAmount: stat.count > 0 ? 
            parseFloat((stat.totalAmount / stat.count).toFixed(2)) : 0,
          successRate: stat.count > 0 ? 
            parseFloat((stat.successCount / stat.count * 100).toFixed(2)) : 0
        }));
      } catch (error) {
        throw new Error(`Error fetching payment method analytics: ${error.message}`);
      }
    },

    // ===== PHÂN TÍCH DOANH THU =====
    revenueBreakdown: async (_, { startDate, endDate }) => {
      try {
        const revenueData = await Booking.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              },
              isDeleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$total' },
              confirmedRevenue: {
                $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] }
              },
              pendingRevenue: {
                $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, '$total', 0] }
              },
              voucherDiscounts: { $sum: '$discount' },
              totalBookings: { $sum: 1 }
            }
          }
        ]);

        const data = revenueData[0] || {};
        const totalRevenue = data.totalRevenue || 0;
        const confirmedRevenue = data.confirmedRevenue || 0;
        const pendingRevenue = data.pendingRevenue || 0;
        const voucherDiscounts = data.voucherDiscounts || 0;
        const totalBookings = data.totalBookings || 0;

        const netRevenue = confirmedRevenue - voucherDiscounts;
        const averageOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        return {
          totalRevenue,
          confirmedRevenue,
          pendingRevenue,
          refundedAmount: 0, // Có thể tính từ cancelled bookings
          netRevenue,
          voucherDiscounts,
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
        };
      } catch (error) {
        throw new Error(`Error fetching revenue breakdown: ${error.message}`);
      }
    },

    // ===== THỐNG KÊ NGƯỜI DÙNG =====
    userAnalytics: async (_, { startDate, endDate }) => {
      try {
        const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
        const activeUsers = await User.countDocuments({
          status: 'active',
          lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          isDeleted: { $ne: true }
        });
        
        const newUsers = await User.countDocuments({
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          isDeleted: { $ne: true }
        });

        const userBookingStats = await Booking.aggregate([
          {
            $match: {
              isDeleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: '$user',
              bookingCount: { $sum: 1 },
              totalSpent: { $sum: '$total' }
            }
          }
        ]);

        const returningCustomers = userBookingStats.filter(stat => stat.bookingCount > 1).length;
        const totalBookings = userBookingStats.reduce((sum, stat) => sum + stat.bookingCount, 0);
        const averageBookingsPerUser = totalUsers > 0 ? totalBookings / totalUsers : 0;

        // Top customers
        const topCustomersData = await Booking.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              },
              isDeleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: '$user',
              totalBookings: { $sum: 1 },
              totalSpent: { $sum: '$total' },
              lastBookingDate: { $max: '$createdAt' }
            }
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'userInfo'
            }
          },
          {
            $lookup: {
              from: 'profiles',
              localField: '_id',
              foreignField: 'user',
              as: 'profileInfo'
            }
          }
        ]);

        const topCustomers = topCustomersData.map(customer => ({
          user: {
            id: customer._id,
            email: customer.userInfo[0]?.email || '',
            phone: customer.userInfo[0]?.phone || '',
            profile: customer.profileInfo[0] ? {
              fullName: customer.profileInfo[0].fullName,
              phone: customer.profileInfo[0].emergencyContact?.phone
            } : null
          },
          totalBookings: customer.totalBookings,
          totalSpent: customer.totalSpent,
          averageBookingValue: customer.totalBookings > 0 ? 
            customer.totalSpent / customer.totalBookings : 0,
          lastBookingDate: customer.lastBookingDate.toISOString().split('T')[0],
          favoriteCategory: null // Có thể tính sau
        }));

        const userGrowthRate = 0; // Có thể tính growth rate

        return {
          totalUsers,
          activeUsers,
          newUsers,
          returningCustomers,
          averageBookingsPerUser: parseFloat(averageBookingsPerUser.toFixed(2)),
          topCustomers,
          userGrowthRate
        };
      } catch (error) {
        throw new Error(`Error fetching user analytics: ${error.message}`);
      }
    },

    // ===== EXPORT DETAILED REPORT =====
    exportDetailedReport: async (_, { startDate, endDate, format, reportType, filters }) => {
      try {
        // Đây chỉ là mock implementation
        // Trong thực tế sẽ cần tạo file CSV/Excel thật và upload lên cloud storage
        const filename = `${reportType}_report_${startDate}_to_${endDate}.${format.toLowerCase()}`;
        const mockUrl = `https://your-storage.com/reports/${filename}`;
        
        // Thực hiện logic export thật ở đây...
        
        return mockUrl;
      } catch (error) {
        throw new Error(`Error exporting report: ${error.message}`);
      }
    }

    // ... Các resolver khác có thể được thêm vào
  },

  Mutation: {
    refreshStatisticsCache: async () => {
      try {
        // Implement cache refresh logic
        return true;
      } catch (error) {
        throw new Error(`Error refreshing statistics cache: ${error.message}`);
      }
    },

    scheduleReport: async (_, { name, frequency, reportType, filters, recipients, format }) => {
      try {
        // Implement schedule report logic
        // Có thể lưu vào database hoặc queue system
        return true;
      } catch (error) {
        throw new Error(`Error scheduling report: ${error.message}`);
      }
    }
  }
};

export default statisticsResolvers;
