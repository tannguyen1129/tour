import { gql } from '@apollo/client';

// ===== DASHBOARD QUERIES =====
export const GET_DASHBOARD_OVERVIEW = gql`
  query GetDashboardOverview($dateRange: DateRangeInput) {
    dashboardOverview(dateRange: $dateRange) {
      totalUsers
      totalTours
      totalBookings
      totalRevenue
      activeUsers
      completedBookings
      pendingBookings
      cancelledBookings
      averageRating
      growthRate
      createdAt
      updatedAt
    }
  }
`;

export const GET_MONTHLY_STATS_FOR_YEAR = gql`
  query GetMonthlyStatsForYear($year: Int!) {
    monthlyStatsForYear(year: $year) {
      month
      year
      totalBookings
      totalRevenue
      confirmedBookings
      pendingBookings
      cancelledBookings
      confirmedRevenue
      pendingRevenue
      averageBookingValue
      newUsers
      returningUsers
      topTour {
        id
        title
        bookingCount
        totalRevenue
      }
      popularCategory {
        id
        name
        bookingCount
        totalRevenue
      }
    }
  }
`;

export const GET_PERIOD_COMPARISON = gql`
  query GetPeriodComparison(
    $currentRange: DateRangeInput!
    $previousRange: DateRangeInput!
  ) {
    periodComparison(
      currentRange: $currentRange
      previousRange: $previousRange
    ) {
      currentPeriod {
        startDate
        endDate
        totalBookings
        totalRevenue
        totalUsers
        totalPassengers
        averageOrderValue
      }
      previousPeriod {
        startDate
        endDate
        totalBookings
        totalRevenue
        totalUsers
        totalPassengers
        averageOrderValue
      }
      growthRate
      revenueGrowthRate
      bookingGrowthRate
      userGrowthRate
      trend
    }
  }
`;

// ===== DETAILED STATS QUERIES =====
export const GET_DAILY_DETAILED_STATS = gql`
  query GetDailyDetailedStats(
    $startDate: String!
    $endDate: String!
    $filters: StatisticsFilterInput
  ) {
    dailyDetailedStats(
      startDate: $startDate
      endDate: $endDate
      filters: $filters
    ) {
      date
      totalBookings
      totalRevenue
      totalPassengers
      averageBookingValue
      bookings {
        id
        bookingDate
        tour {
          id
          title
          price
          location
          category {
            id
            name
          }
        }
        user {
          id
          email
          phone
          profile {
            fullName
            phone
          }
        }
        passengers {
          name
          age
          type
        }
        totalAmount
        basePrice
        discount
        paymentMethod
        status
        paymentStatus
        voucher {
          id
          code
          type
          discountValue
          appliedDiscount
        }
        createdAt
      }
      topTour {
        id
        title
        bookingCount
        totalRevenue
      }
      paymentMethodBreakdown {
        method
        count
        totalAmount
        percentage
      }
    }
  }
`;

export const GET_BOOKING_DETAILS_IN_RANGE = gql`
  query GetBookingDetailsInRange(
    $startDate: String!
    $endDate: String!
    $filters: StatisticsFilterInput
    $limit: Int
    $offset: Int
    $sortBy: String
    $sortOrder: String
  ) {
    bookingDetailsInRange(
      startDate: $startDate
      endDate: $endDate
      filters: $filters
      limit: $limit
      offset: $offset
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      id
      bookingDate
      tour {
        id
        title
        price
        location
        category {
          id
          name
        }
      }
      user {
        id
        email
        phone
        profile {
          fullName
          phone
        }
      }
      passengers {
        name
        age
        type
      }
      totalAmount
      basePrice
      discount
      paymentMethod
      status
      paymentStatus
      voucher {
        id
        code
        type
        discountValue
        appliedDiscount
      }
      createdAt
    }
  }
`;

// ===== TOUR ANALYTICS QUERIES =====
export const GET_TOUR_DETAILED_STATS = gql`
  query GetTourDetailedStats(
    $tourId: ID!
    $startDate: String!
    $endDate: String!
  ) {
    tourDetailedStats(
      tourId: $tourId
      startDate: $startDate
      endDate: $endDate
    ) {
      tour {
        id
        title
        price
        location
        category {
          id
          name
        }
      }
      dateRange
      totalBookings
      totalRevenue
      totalPassengers
      averageRating
      ratingCount
      bookingsByStatus {
        status
        count
        percentage
        revenue
      }
      revenueByMonth {
        month
        year
        revenue
        bookingCount
        growthRate
      }
      bookingTrend {
        date
        bookingCount
        revenue
        passengerCount
        averageBookingValue
      }
      topCustomers {
        user {
          id
          email
          profile {
            fullName
          }
        }
        totalBookings
        totalSpent
        averageBookingValue
      }
    }
  }
`;

export const GET_TOP_TOURS = gql`
  query GetTopTours(
    $startDate: String!
    $endDate: String!
    $sortBy: String!
    $limit: Int
  ) {
    topTours(
      startDate: $startDate
      endDate: $endDate
      sortBy: $sortBy
      limit: $limit
    ) {
      id
      title
      price
      location
      categoryName
      bookingCount
      totalRevenue
      totalPassengers
      averageRating
      averageBookingValue
    }
  }
`;

// ===== CATEGORY ANALYTICS =====
export const GET_CATEGORY_ANALYTICS = gql`
  query GetCategoryAnalytics(
    $startDate: String!
    $endDate: String!
    $sortBy: String
    $limit: Int
  ) {
    categoryAnalytics(
      startDate: $startDate
      endDate: $endDate
      sortBy: $sortBy
      limit: $limit
    ) {
      category {
        id
        name
      }
      totalTours
      activeTours
      totalBookings
      totalRevenue
      averageRating
      popularityRank
      topTours {
        id
        title
        bookingCount
        totalRevenue
      }
    }
  }
`;

// ===== PAYMENT & REVENUE ANALYTICS =====
export const GET_PAYMENT_METHOD_ANALYTICS = gql`
  query GetPaymentMethodAnalytics(
    $startDate: String!
    $endDate: String!
  ) {
    paymentMethodAnalytics(
      startDate: $startDate
      endDate: $endDate
    ) {
      method
      count
      totalAmount
      percentage
      averageAmount
      successRate
    }
  }
`;

export const GET_REVENUE_BREAKDOWN = gql`
  query GetRevenueBreakdown(
    $startDate: String!
    $endDate: String!
    $groupBy: String
  ) {
    revenueBreakdown(
      startDate: $startDate
      endDate: $endDate
      groupBy: $groupBy
    ) {
      totalRevenue
      confirmedRevenue
      pendingRevenue
      refundedAmount
      netRevenue
      voucherDiscounts
      averageOrderValue
    }
  }
`;

// ===== USER ANALYTICS =====
export const GET_USER_ANALYTICS = gql`
  query GetUserAnalytics(
    $startDate: String!
    $endDate: String!
  ) {
    userAnalytics(
      startDate: $startDate
      endDate: $endDate
    ) {
      totalUsers
      activeUsers
      newUsers
      returningCustomers
      averageBookingsPerUser
      userGrowthRate
      topCustomers {
        user {
          id
          email
          phone
          profile {
            fullName
            phone
          }
        }
        totalBookings
        totalSpent
        averageBookingValue
        lastBookingDate
        favoriteCategory
      }
    }
  }
`;

// ===== COMPREHENSIVE REPORT =====
export const GET_COMPREHENSIVE_REPORT = gql`
  query GetComprehensiveReport(
    $startDate: String!
    $endDate: String!
    $includeDetails: Boolean
  ) {
    comprehensiveReport(
      startDate: $startDate
      endDate: $endDate
      includeDetails: $includeDetails
    ) {
      overview {
        totalUsers
        totalTours
        totalBookings
        totalRevenue
        activeUsers
        completedBookings
        pendingBookings
        cancelledBookings
        averageRating
        growthRate
      }
      monthlyStats {
        month
        year
        totalBookings
        totalRevenue
        confirmedBookings
        pendingBookings
        cancelledBookings
        confirmedRevenue
        pendingRevenue
        averageBookingValue
        newUsers
      }
      topTours {
        id
        title
        price
        location
        categoryName
        bookingCount
        totalRevenue
        totalPassengers
        averageRating
        averageBookingValue
      }
      topCategories {
        category {
          id
          name
        }
        totalTours
        activeTours
        totalBookings
        totalRevenue
        averageRating
        popularityRank
      }
      userStats {
        totalUsers
        activeUsers
        newUsers
        returningCustomers
        averageBookingsPerUser
        userGrowthRate
      }
      revenueBreakdown {
        totalRevenue
        confirmedRevenue
        pendingRevenue
        refundedAmount
        netRevenue
        voucherDiscounts
        averageOrderValue
      }
      paymentStats {
        method
        count
        totalAmount
        percentage
        averageAmount
        successRate
      }
      generatedAt
    }
  }
`;

// ===== EXPORT QUERIES =====
export const EXPORT_DETAILED_REPORT = gql`
  query ExportDetailedReport(
    $startDate: String!
    $endDate: String!
    $format: String!
    $reportType: String!
    $filters: StatisticsFilterInput
  ) {
    exportDetailedReport(
      startDate: $startDate
      endDate: $endDate
      format: $format
      reportType: $reportType
      filters: $filters
    ) {
      url
      filename
      format
      createdAt
      expiresAt
    }
  }
`;

// ===== MUTATIONS =====
export const REFRESH_STATISTICS_CACHE = gql`
  mutation RefreshStatisticsCache {
    refreshStatisticsCache
  }
`;

export const SCHEDULE_REPORT = gql`
  mutation ScheduleReport(
    $name: String!
    $frequency: String!
    $reportType: String!
    $filters: StatisticsFilterInput!
    $recipients: [String!]!
    $format: String
  ) {
    scheduleReport(
      name: $name
      frequency: $frequency
      reportType: $reportType
      filters: $filters
      recipients: $recipients
      format: $format
    )
  }
`;

export const DELETE_EXPORTED_REPORT = gql`
  mutation DeleteExportedReport($reportId: ID!) {
    deleteExportedReport(reportId: $reportId)
  }
`;

// ===== CUSTOM HOOKS FOR EASY USAGE =====

// Hook cho Dashboard Overview
export const useDashboardOverview = (dateRange = null) => {
  return {
    query: GET_DASHBOARD_OVERVIEW,
    variables: { dateRange }
  };
};

// Hook cho Monthly Stats (cho biểu đồ cột)
export const useMonthlyStats = (year = new Date().getFullYear()) => {
  return {
    query: GET_MONTHLY_STATS_FOR_YEAR,
    variables: { year }
  };
};

// Hook cho Period Comparison
export const usePeriodComparison = (currentRange, previousRange) => {
  return {
    query: GET_PERIOD_COMPARISON,
    variables: { currentRange, previousRange }
  };
};

// Hook cho Daily Detailed Stats
export const useDailyDetailedStats = (startDate, endDate, filters = null) => {
  return {
    query: GET_DAILY_DETAILED_STATS,
    variables: { startDate, endDate, filters }
  };
};

// Hook cho Booking Details in Range
export const useBookingDetailsInRange = (
  startDate,
  endDate,
  options = {}
) => {
  const {
    filters = null,
    limit = 100,
    offset = 0,
    sortBy = "createdAt",
    sortOrder = "DESC"
  } = options;

  return {
    query: GET_BOOKING_DETAILS_IN_RANGE,
    variables: {
      startDate,
      endDate,
      filters,
      limit,
      offset,
      sortBy,
      sortOrder
    }
  };
};

// Hook cho Top Tours
export const useTopTours = (startDate, endDate, sortBy = "revenue", limit = 10) => {
  return {
    query: GET_TOP_TOURS,
    variables: { startDate, endDate, sortBy, limit }
  };
};

// Hook cho Payment Analytics
export const usePaymentAnalytics = (startDate, endDate) => {
  return {
    query: GET_PAYMENT_METHOD_ANALYTICS,
    variables: { startDate, endDate }
  };
};

// Hook cho Revenue Breakdown
export const useRevenueBreakdown = (startDate, endDate, groupBy = "day") => {
  return {
    query: GET_REVENUE_BREAKDOWN,
    variables: { startDate, endDate, groupBy }
  };
};

// Hook cho User Analytics
export const useUserAnalytics = (startDate, endDate) => {
  return {
    query: GET_USER_ANALYTICS,
    variables: { startDate, endDate }
  };
};

// Hook cho Category Analytics
export const useCategoryAnalytics = (startDate, endDate, sortBy = "revenue", limit = 10) => {
  return {
    query: GET_CATEGORY_ANALYTICS,
    variables: { startDate, endDate, sortBy, limit }
  };
};

// Hook cho Comprehensive Report
export const useComprehensiveReport = (startDate, endDate, includeDetails = false) => {
  return {
    query: GET_COMPREHENSIVE_REPORT,
    variables: { startDate, endDate, includeDetails }
  };
};

// ===== UTILITY FUNCTIONS =====

// Function để tạo date range cho các query thường dùng
export const createDateRange = (startDate, endDate) => ({
  startDate: startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate,
  endDate: endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate
});

// Function để tạo date range cho last 30 days
export const getLast30DaysRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  return createDateRange(startDate, endDate);
};

// Function để tạo date range cho current month
export const getCurrentMonthRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return createDateRange(startDate, endDate);
};

// Function để tạo date range cho last month
export const getLastMonthRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return createDateRange(startDate, endDate);
};

// Function để tạo date range cho current year
export const getCurrentYearRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  const endDate = new Date(now.getFullYear(), 11, 31);
  
  return createDateRange(startDate, endDate);
};

// Function để format số tiền
export const formatCurrency = (amount, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Function để format phần trăm
export const formatPercentage = (value, decimals = 1) => {
  return `${parseFloat(value).toFixed(decimals)}%`;
};

// Function để format số với dấu phẩy
export const formatNumber = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number);
};

// Export default object chứa tất cả
export default {
  // Queries
  GET_DASHBOARD_OVERVIEW,
  GET_MONTHLY_STATS_FOR_YEAR,
  GET_PERIOD_COMPARISON,
  GET_DAILY_DETAILED_STATS,
  GET_BOOKING_DETAILS_IN_RANGE,
  GET_TOUR_DETAILED_STATS,
  GET_TOP_TOURS,
  GET_CATEGORY_ANALYTICS,
  GET_PAYMENT_METHOD_ANALYTICS,
  GET_REVENUE_BREAKDOWN,
  GET_USER_ANALYTICS,
  GET_COMPREHENSIVE_REPORT,
  EXPORT_DETAILED_REPORT,
  
  // Mutations
  REFRESH_STATISTICS_CACHE,
  SCHEDULE_REPORT,
  DELETE_EXPORTED_REPORT,
  
  // Hooks
  useDashboardOverview,
  useMonthlyStats,
  usePeriodComparison,
  useDailyDetailedStats,
  useBookingDetailsInRange,
  useTopTours,
  usePaymentAnalytics,
  useRevenueBreakdown,
  useUserAnalytics,
  useCategoryAnalytics,
  useComprehensiveReport,
  
  // Utilities
  createDateRange,
  getLast30DaysRange,
  getCurrentMonthRange,
  getLastMonthRange,
  getCurrentYearRange,
  formatCurrency,
  formatPercentage,
  formatNumber
};
