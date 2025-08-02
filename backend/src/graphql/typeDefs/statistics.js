import { gql } from 'apollo-server-express';

export default gql`
  scalar DateTime

  # ===== INPUT TYPES =====
  input DateRangeInput {
    startDate: String!
    endDate: String!
  }

  input StatisticsFilterInput {
    dateRange: DateRangeInput
    status: String
    tourId: ID
    userId: ID
    categoryId: ID
    paymentMethod: String
  }

  # ===== TỔNG QUAN DASHBOARD =====
  type DashboardOverview {
    totalUsers: Int!
    totalTours: Int!
    totalBookings: Int!
    totalRevenue: Float!
    activeUsers: Int!
    completedBookings: Int!
    pendingBookings: Int!
    cancelledBookings: Int!
    averageRating: Float
    growthRate: Float
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ===== THỐNG KÊ THEO THÁNG (CHO BIỂU ĐỒ CỘT) =====
  type MonthlyStats {
    month: Int!
    year: Int!
    totalBookings: Int!
    totalRevenue: Float!
    confirmedBookings: Int!
    pendingBookings: Int!
    cancelledBookings: Int!
    confirmedRevenue: Float!
    pendingRevenue: Float!
    averageBookingValue: Float!
    newUsers: Int!
    returningUsers: Int!
    topTour: TourSummary
    popularCategory: CategorySummary
  }

  # ===== THỐNG KÊ CHI TIẾT THEO NGÀY =====
  type DailyBookingStats {
    date: String!
    bookings: [BookingDetail!]!
    totalBookings: Int!
    totalRevenue: Float!
    totalPassengers: Int!
    averageBookingValue: Float!
    topTour: TourSummary
    paymentMethodBreakdown: [PaymentMethodStats!]!
  }

  # ===== CHI TIẾT TỪNG BOOKING =====
  type BookingDetail {
    id: ID!
    bookingDate: String!
    tour: TourInfo!
    user: UserInfo!
    passengers: [PassengerInfo!]!
    totalAmount: Float!
    basePrice: Float!
    discount: Float!
    paymentMethod: String
    status: String!
    paymentStatus: String!
    voucher: VoucherUsage
    createdAt: DateTime!
  }

  type TourInfo {
    id: ID!
    title: String!
    price: Float!
    location: String
    category: CategoryInfo
  }

  type UserInfo {
    id: ID!
    email: String!
    phone: String
    profile: ProfileInfo
  }

  type ProfileInfo {
    fullName: String
    phone: String
  }

  type PassengerInfo {
    name: String!
    age: Int!
    type: String!
  }

  type CategoryInfo {
    id: ID!
    name: String!
  }

  type VoucherUsage {
    id: ID!
    code: String!
    type: String!
    discountValue: Float!
    appliedDiscount: Float!
  }

  # ===== THỐNG KÊ TOUR =====
  type TourSummary {
    id: ID!
    title: String!
    price: Float!
    location: String
    categoryName: String
    bookingCount: Int!
    totalRevenue: Float!
    totalPassengers: Int!
    averageRating: Float
    averageBookingValue: Float!
  }

  type TourDetailStats {
    tour: TourInfo!
    dateRange: String!
    totalBookings: Int!
    totalRevenue: Float!
    totalPassengers: Int!
    averageRating: Float!
    ratingCount: Int!
    bookingsByStatus: [StatusBreakdown!]!
    revenueByMonth: [MonthlyRevenue!]!
    bookingTrend: [DailyTrend!]!
    topCustomers: [CustomerSummary!]!
  }

  # ===== THỐNG KÊ CATEGORY =====
  type CategorySummary {
    id: ID!
    name: String!
    description: String
    tourCount: Int!
    bookingCount: Int!
    totalRevenue: Float!
  }

  type CategoryStats {
    category: CategoryInfo!
    totalTours: Int!
    activeTours: Int!
    totalBookings: Int!
    totalRevenue: Float!
    averageRating: Float!
    popularityRank: Int!
    topTours: [TourSummary!]!
  }

  # ===== PHÂN TÍCH THANH TOÁN =====
  type PaymentMethodStats {
    method: String!
    count: Int!
    totalAmount: Float!
    percentage: Float!
    averageAmount: Float!
    successRate: Float!
  }

  type RevenueBreakdown {
    totalRevenue: Float!
    confirmedRevenue: Float!
    pendingRevenue: Float!
    refundedAmount: Float!
    netRevenue: Float!
    voucherDiscounts: Float!
    averageOrderValue: Float!
  }

  # ===== THỐNG KÊ NGƯỜI DÙNG =====
  type UserStats {
    totalUsers: Int!
    activeUsers: Int!
    newUsers: Int!
    returningCustomers: Int!
    averageBookingsPerUser: Float!
    topCustomers: [CustomerSummary!]!
    userGrowthRate: Float!
  }

  type CustomerSummary {
    user: UserInfo!
    totalBookings: Int!
    totalSpent: Float!
    averageBookingValue: Float!
    lastBookingDate: String
    favoriteCategory: String
  }

  # ===== PHÂN TÍCH TREND =====
  type StatusBreakdown {
    status: String!
    count: Int!
    percentage: Float!
    revenue: Float!
  }

  type MonthlyRevenue {
    month: Int!
    year: Int!
    revenue: Float!
    bookingCount: Int!
    growthRate: Float!
  }

  type DailyTrend {
    date: String!
    bookingCount: Int!
    revenue: Float!
    passengerCount: Int!
    averageBookingValue: Float!
  }

  # ===== SO SÁNH THEO THỜI GIAN =====
  type PeriodComparison {
    currentPeriod: ComparisonData!
    previousPeriod: ComparisonData!
    growthRate: Float!
    revenueGrowthRate: Float!
    bookingGrowthRate: Float!
    userGrowthRate: Float!
    trend: String! # "UP", "DOWN", "STABLE"
  }

  type ComparisonData {
    startDate: String!
    endDate: String!
    totalBookings: Int!
    totalRevenue: Float!
    totalUsers: Int!
    totalPassengers: Int!
    averageOrderValue: Float!
    topTour: TourSummary
    topCategory: CategorySummary
  }

  # ===== EXPORT REPORT =====
  type ExportReport {
    url: String!
    filename: String!
    format: String!
    createdAt: DateTime!
    expiresAt: DateTime!
  }

  # ===== QUERIES =====
  extend type Query {
    # TỔNG QUAN DASHBOARD
    dashboardOverview(dateRange: DateRangeInput): DashboardOverview!
    
    # BIỂU ĐỒ CỘT - Thống kê theo tháng trong năm
    monthlyStatsForYear(year: Int!): [MonthlyStats!]!
    
    # So sánh theo khoảng thời gian
    periodComparison(
      currentRange: DateRangeInput!
      previousRange: DateRangeInput!
    ): PeriodComparison!
    
    # THỐNG KÊ CHI TIẾT THEO NGÀY
    dailyDetailedStats(
      startDate: String!
      endDate: String!
      filters: StatisticsFilterInput
    ): [DailyBookingStats!]!
    
    # Chi tiết booking trong khoảng thời gian
    bookingDetailsInRange(
      startDate: String!
      endDate: String!
      filters: StatisticsFilterInput
      limit: Int = 100
      offset: Int = 0
      sortBy: String = "createdAt"
      sortOrder: String = "DESC"
    ): [BookingDetail!]!
    
    # Thống kê chi tiết theo tour
    tourDetailedStats(
      tourId: ID!
      startDate: String!
      endDate: String!
    ): TourDetailStats!
    
    # Top tours theo doanh thu/booking
    topTours(
      startDate: String!
      endDate: String!
      sortBy: String! # "revenue", "bookings", "rating", "passengers"
      limit: Int = 10
    ): [TourSummary!]!
    
    # Thống kê theo danh mục
    categoryAnalytics(
      startDate: String!
      endDate: String!
      sortBy: String = "revenue"
      limit: Int = 10
    ): [CategoryStats!]!
    
    # Phân tích thanh toán
    paymentMethodAnalytics(
      startDate: String!
      endDate: String!
    ): [PaymentMethodStats!]!
    
    # Phân tích doanh thu
    revenueBreakdown(
      startDate: String!
      endDate: String!
      groupBy: String = "day" # "day", "week", "month"
    ): RevenueBreakdown!
    
    # Thống kê người dùng
    userAnalytics(
      startDate: String!
      endDate: String!
    ): UserStats!
    
    # Báo cáo tổng hợp cho admin
    comprehensiveReport(
      startDate: String!
      endDate: String!
      includeDetails: Boolean = false
    ): ComprehensiveReport!
    
    # Export báo cáo
    exportDetailedReport(
      startDate: String!
      endDate: String!
      format: String! # "CSV", "EXCEL", "PDF"
      reportType: String! # "overview", "detailed", "tours", "users"
      filters: StatisticsFilterInput
    ): ExportReport!
  }

  # ===== COMPREHENSIVE REPORT =====
  type ComprehensiveReport {
    overview: DashboardOverview!
    monthlyStats: [MonthlyStats!]!
    topTours: [TourSummary!]!
    topCategories: [CategoryStats!]!
    userStats: UserStats!
    revenueBreakdown: RevenueBreakdown!
    paymentStats: [PaymentMethodStats!]!
    generatedAt: DateTime!
  }

  # ===== MUTATIONS =====
  extend type Mutation {
    # Làm mới cache thống kê
    refreshStatisticsCache: Boolean!
    
    # Tạo báo cáo theo lịch trình
    scheduleReport(
      name: String!
      frequency: String! # "DAILY", "WEEKLY", "MONTHLY"
      reportType: String! # "overview", "detailed", "comprehensive"
      filters: StatisticsFilterInput!
      recipients: [String!]! # Email addresses
      format: String = "PDF" # "CSV", "EXCEL", "PDF"
    ): Boolean!
    
    # Xóa báo cáo đã export
    deleteExportedReport(reportId: ID!): Boolean!
  }
`;
