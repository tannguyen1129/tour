import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

// ✅ Base schema to prevent extend type errors
const baseSchema = `
  scalar DateTime
  
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
  
  type Subscription {
    _empty: String
  }
`;

// ✅ Import existing schemas in correct order
import authTypeDefs from './typeDefs/auth.js';
import tourTypeDefs from './typeDefs/tour.js';
import bookingTypeDefs from './typeDefs/booking.js';
import paymentTypeDefs from './typeDefs/payment.js';
import categoryTypeDefs from './typeDefs/category.js';
import voucherTypeDefs from './typeDefs/voucher.js';
import reviewTypeDefs from './typeDefs/review.js';
import logTypeDefs from './typeDefs/log.js';
import profileTypeDefs from './typeDefs/profile.js';
import statisticsTypeDefs from './typeDefs/statistics.js';

// ✅ Import resolvers
import authResolvers from './resolvers/auth.js';
import tourResolvers from './resolvers/tour.js';
import bookingResolvers from './resolvers/booking.js';
import paymentResolvers from './resolvers/payment.js';
import categoryResolvers from './resolvers/category.js';
import voucherResolvers from './resolvers/voucher.js';
import reviewResolvers from './resolvers/review.js';
import logResolvers from './resolvers/log.js';
import profileResolvers from './resolvers/profile.js';
import statisticsResolvers from './resolvers/statistics.js';

// ✅ Merge schemas in proper order
export const typeDefs = mergeTypeDefs([
  baseSchema,
  authTypeDefs,
  tourTypeDefs,
  bookingTypeDefs,
  paymentTypeDefs,
  categoryTypeDefs,
  voucherTypeDefs,
  reviewTypeDefs,
  logTypeDefs,
  profileTypeDefs,
  statisticsTypeDefs
]);

// ✅ Merge resolvers
export const resolvers = mergeResolvers([
  authResolvers,
  tourResolvers,
  bookingResolvers,
  paymentResolvers,
  categoryResolvers,
  voucherResolvers,
  reviewResolvers,
  logResolvers,
  profileResolvers,
  statisticsResolvers
]);
